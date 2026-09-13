const models = require('../src/models');
const controller = require('../src/controllers/orderController');

jest.mock('../src/models', () => ({
  Order: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  OrderItem: { bulkCreate: jest.fn() },
  Product: { findByPk: jest.fn() },
  RestaurantTable: { update: jest.fn(), findByPk: jest.fn() },
  User: { findByPk: jest.fn() },
  Reservation: { update: jest.fn() },
  Payment: { findOrCreate: jest.fn() },
  PointHistory: { create: jest.fn() },
  sequelize: { transaction: jest.fn() }
}));

const makeResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeTransaction = () => ({ commit: jest.fn(), rollback: jest.fn() });

let logSpy, errorSpy;
beforeAll(() => {
  // Silence console logs and errors during test execution
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (logSpy && typeof logSpy.mockRestore === 'function') logSpy.mockRestore();
  if (errorSpy && typeof errorSpy.mockRestore === 'function') errorSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  models.sequelize.transaction.mockResolvedValue(makeTransaction());
  models.OrderItem.bulkCreate.mockResolvedValue([]);
  models.RestaurantTable.update.mockResolvedValue([1]);
  models.Reservation.update.mockResolvedValue([1]);
  models.Payment.findOrCreate.mockResolvedValue([{ update: jest.fn().mockResolvedValue() }, true]);
});

// ==========================================
// WHITE-BOX TEST CASES FOR ORDER CONTROLLER
// ==========================================
describe('WHITE-BOX TEST CASES FOR ORDER & PAYMENT', () => {
  test('WB-ORD-01: items missing or empty array', async () => {
    const res = makeResponse();
    await controller.createOrder({ body: { items: [] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng phải có ít nhất một món ăn" });
  });

  test('WB-ORD-02: items is null or undefined', async () => {
    const res = makeResponse();
    await controller.createOrder({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('WB-ORD-03: Product not found by ID', async () => {
    models.Product.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.createOrder({ body: { items: [{ product_id: 999, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Sản phẩm với ID 999 không tồn tại" });
  });

  test('WB-ORD-04: item with custom note and item without note', async () => {
    const product1 = { id: 1, price: 50 };
    const product2 = { id: 2, price: 70 };
    models.Product.findByPk.mockImplementation((id) => Promise.resolve(id === 1 ? product1 : product2));
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({
      body: {
        items: [
          { product_id: 1, quantity: 1, note: 'Không cay' },
          { product_id: 2, quantity: 2 }
        ]
      }
    }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.OrderItem.bulkCreate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ product_id: 1, note: 'Không cay', totalPrice: 50 }),
        expect.objectContaining({ product_id: 2, note: '', totalPrice: 140 })
      ]),
      expect.any(Object)
    );
  });

  test('WB-ORD-05: user points deduction succeeds when user has enough points', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 10, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 10, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(user.update).toHaveBeenCalledWith({ points: 0 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ discountAmount: 10, finalPrice: 90 }), expect.any(Object));
  });

  test('WB-ORD-06: user points deduction fails when user points < used_points', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 5, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 10, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Số điểm tích lũy (5) không đủ để áp dụng (10)" });
  });

  test('WB-ORD-07: missing user in DB skips points deduction', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(null);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ body: { user_id: 999, used_points: 10, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ discountAmount: 0, finalPrice: 100 }), expect.any(Object));
  });

  test('WB-ORD-08: discount greater than totalPrice sets finalPrice to 0', async () => {
    const product = { id: 1, price: 30 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 30, discountAmount: 50, finalPrice: 0 }), expect.any(Object));
  });

  test('WB-ORD-09: table_id provided updates table status to OCCUPIED', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ body: { table_id: 5, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'OCCUPIED' }, { where: { id: 5 }, transaction: expect.any(Object) });
  });

  test('WB-ORD-10: table_id omitted does not update table status', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ body: { items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(models.RestaurantTable.update).not.toHaveBeenCalled();
  });

  test('WB-ORD-11: getAllOrders without query parameters', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = makeResponse();
    await controller.getAllOrders({ query: {} }, res);

    expect(models.Order.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('WB-ORD-12: getAllOrders with status and paymentStatus query parameters', async () => {
    models.Order.findAll.mockResolvedValue([]);
    const res = makeResponse();
    await controller.getAllOrders({ query: { status: 'READY', paymentStatus: 'PAID' } }, res);

    expect(models.Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'READY', paymentStatus: 'PAID' }
    }));
  });

  test('WB-ORD-13: getAllOrders database exception forwards to next', async () => {
    const err = new Error('db error');
    models.Order.findAll.mockRejectedValue(err);
    const next = jest.fn();
    await controller.getAllOrders({ query: {} }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-14: getOrderById found order returns 200', async () => {
    const order = { id: 1, totalPrice: 100 };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.getOrderById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith(order);
  });

  test('WB-ORD-15: getOrderById not found returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.getOrderById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('WB-ORD-16: getOrderById database exception forwards to next', async () => {
    const err = new Error('get error');
    models.Order.findByPk.mockRejectedValue(err);
    const next = jest.fn();
    await controller.getOrderById({ params: { id: 1 } }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-17: updateOrderStatus found order updates status successfully', async () => {
    const order = { id: 1, status: 'PENDING', update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.updateOrderStatus({ params: { id: 1 }, body: { status: 'CONFIRMED' } }, res);

    expect(order.update).toHaveBeenCalledWith({ status: 'CONFIRMED' }, expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật trạng thái thành công", data: order });
  });

  test('WB-ORD-18: updateOrderStatus missing order returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.updateOrderStatus({ params: { id: 999 }, body: { status: 'CANCELLED' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('WB-ORD-19: updateOrderStatus exception forwards to next', async () => {
    const err = new Error('update error');
    models.Order.findByPk.mockRejectedValue(err);
    const next = jest.fn();
    await controller.updateOrderStatus({ params: { id: 1 }, body: { status: 'CANCELLED' } }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-20: deleteOrder found order destroys successfully', async () => {
    const order = { id: 1, destroy: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.deleteOrder({ params: { id: 1 } }, res);

    expect(order.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Xóa đơn hàng thành công" });
  });

  test('WB-ORD-21: deleteOrder missing order returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.deleteOrder({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('WB-ORD-22: deleteOrder exception forwards to next', async () => {
    const err = new Error('delete error');
    models.Order.findByPk.mockRejectedValue(err);
    const next = jest.fn();
    await controller.deleteOrder({ params: { id: 1 } }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-23: getCurrentOrderByTable returns orders array', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = makeResponse();
    await controller.getCurrentOrderByTable({ params: { tableId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('WB-ORD-24: getCurrentOrderByTable returns empty array when no orders', async () => {
    models.Order.findAll.mockResolvedValue([]);
    const res = makeResponse();
    await controller.getCurrentOrderByTable({ params: { tableId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('WB-ORD-25: getCurrentOrderByTable exception forwards to next', async () => {
    const err = new Error('table error');
    models.Order.findAll.mockRejectedValue(err);
    const next = jest.fn();
    await controller.getCurrentOrderByTable({ params: { tableId: 1 } }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-26: payAllOrdersByTable returns 404 when no unpaid orders', async () => {
    models.Order.findAll.mockResolvedValue([]);
    const res = makeResponse();
    await controller.payAllOrdersByTable({ params: { tableId: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng cần thanh toán" });
  });

  test('WB-ORD-27: payAllOrdersByTable returns 400 when an order is not READY or COMPLETED', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1, status: 'READY' }, { id: 2, status: 'PENDING' }]);
    const res = makeResponse();
    await controller.payAllOrdersByTable({ params: { tableId: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Không thể thanh toán. Có đơn hàng chưa hoàn thành chế biến.",
      invalidOrderIds: [2]
    }));
  });

  test('WB-ORD-28: payAllOrdersByTable successfully pays ready orders and frees table', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1, status: 'READY' }, { id: 2, status: 'COMPLETED' }]);
    models.Order.update.mockResolvedValue([2]);
    const res = makeResponse();
    await controller.payAllOrdersByTable({ params: { tableId: 5 }, body: { paymentMethod: 'TRANSFER' } }, res);

    expect(models.Order.update).toHaveBeenCalledWith(
      { paymentStatus: 'PAID', status: 'COMPLETED', paymentMethod: 'TRANSFER' },
      expect.objectContaining({ where: { id: [1, 2] } })
    );
    expect(models.RestaurantTable.update).toHaveBeenCalledWith(
      { status: 'AVAILABLE' },
      expect.objectContaining({ where: { id: 5 } })
    );
    expect(models.Reservation.update).toHaveBeenCalledWith(
      { status: 'COMPLETED' },
      expect.objectContaining({ where: { table_id: 5, status: 'CHECKED_IN' } })
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Đã thanh toán thành công 2 đơn hàng." });
  });

  test('WB-ORD-29: payAllOrdersByTable exception rolls back and forwards to next', async () => {
    const err = new Error('pay all error');
    models.Order.findAll.mockRejectedValue(err);
    const next = jest.fn();
    await controller.payAllOrdersByTable({ params: { tableId: 1 }, body: {} }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-30: payOrder returns 404 when order is not found', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.payOrder({ params: { id: 999 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('WB-ORD-31: payOrder returns 400 when order is already PAID', async () => {
    models.Order.findByPk.mockResolvedValue({ id: 1, paymentStatus: 'PAID' });
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng này đã được thanh toán trước đó" });
  });

  test('WB-ORD-32: payOrder returns 400 when order status is not READY or COMPLETED', async () => {
    models.Order.findByPk.mockResolvedValue({ id: 1, paymentStatus: 'UNPAID', status: 'PREPARING' });
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng phải ở trạng thái 'Chờ phục vụ' mới có thể thanh toán" });
  });

  test('WB-ORD-33: payOrder successfully pays order without table', async () => {
    const order = { id: 1, paymentStatus: 'UNPAID', status: 'READY', table_id: null, update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);

    expect(order.update).toHaveBeenCalledWith(
      { paymentStatus: 'PAID', status: 'COMPLETED', paymentMethod: 'CASH' },
      expect.any(Object)
    );
    expect(models.RestaurantTable.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán thành công. Bàn hiện đã sẵn sàng." });
  });

  test('WB-ORD-34: payOrder successfully pays order with table and completes reservation', async () => {
    const order = { id: 1, paymentStatus: 'UNPAID', status: 'READY', table_id: 3, update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: { paymentMethod: 'TRANSFER' } }, res);

    expect(order.update).toHaveBeenCalledWith(
      { paymentStatus: 'PAID', status: 'COMPLETED', paymentMethod: 'TRANSFER' },
      expect.any(Object)
    );
    expect(models.RestaurantTable.update).toHaveBeenCalledWith(
      { status: 'AVAILABLE' },
      expect.objectContaining({ where: { id: 3 } })
    );
    expect(models.Reservation.update).toHaveBeenCalledWith(
      { status: 'COMPLETED' },
      expect.objectContaining({ where: { table_id: 3, status: 'CHECKED_IN' } })
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán thành công. Bàn hiện đã sẵn sàng." });
  });

  test('WB-ORD-35: payOrder database exception rolls back and forwards to next', async () => {
    const err = new Error('pay error');
    models.Order.findByPk.mockRejectedValue(err);
    const next = jest.fn();
    await controller.payOrder({ params: { id: 1 }, body: {} }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-36: getMyOrders successfully returns user orders', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1, user_id: 5 }]);
    const res = makeResponse();
    await controller.getMyOrders({ user: { id: 5 } }, res);

    expect(models.Order.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { user_id: 5 } }));
    expect(res.json).toHaveBeenCalledWith([{ id: 1, user_id: 5 }]);
  });

  test('WB-ORD-37: getMyOrders exception forwards to next', async () => {
    const err = new Error('my orders error');
    models.Order.findAll.mockRejectedValue(err);
    const next = jest.fn();
    await controller.getMyOrders({ user: { id: 5 } }, makeResponse(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('WB-ORD-38: createOrder throws error when product is unavailable (isAvailable === false)', async () => {
    const fakeProduct = { id: 1, name: 'Cà phê', price: 25000, isAvailable: false, stock: 10 };
    models.Product.findByPk.mockResolvedValue(fakeProduct);

    const req = {
      body: {
        table_id: 1,
        items: [{ product_id: 1, quantity: 1 }]
      }
    };
    const res = makeResponse();
    const next = jest.fn();

    await controller.createOrder(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Món "Cà phê" hiện đang tạm ngưng phục vụ!'
    }));
  });

  test('WB-ORD-39: createOrder throws error when product stock is insufficient (stock < quantity)', async () => {
    const fakeProduct = { id: 1, name: 'Trà đào', price: 30000, isAvailable: true, stock: 2 };
    models.Product.findByPk.mockResolvedValue(fakeProduct);

    const req = {
      body: {
        table_id: 1,
        items: [{ product_id: 1, quantity: 5 }]
      }
    };
    const res = makeResponse();
    const next = jest.fn();

    await controller.createOrder(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Món "Trà đào" chỉ còn 2 suất trong kho, không đủ phục vụ (5 suất)!'
    }));
  });

  test('WB-ORD-40: createOrder deducts stock and sets isAvailable=false when newStock === 0', async () => {
    const fakeProduct = {
      id: 1,
      name: 'Bánh ngọt',
      price: 20000,
      isAvailable: true,
      stock: 2,
      update: jest.fn().mockResolvedValue(true)
    };
    models.Product.findByPk.mockResolvedValue(fakeProduct);
    models.RestaurantTable.update.mockResolvedValue([1]);
    const createdOrder = { id: 99, table_id: 1 };
    models.Order.create.mockResolvedValue(createdOrder);
    models.Order.findByPk.mockResolvedValue(createdOrder);
    models.OrderItem.bulkCreate.mockResolvedValue([]);

    const req = {
      body: {
        table_id: 1,
        items: [{ product_id: 1, quantity: 2 }]
      }
    };
    const res = makeResponse();
    const next = jest.fn();

    await controller.createOrder(req, res, next);

    expect(fakeProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0, isAvailable: false }),
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('WB-ORD-41: deleteOrder restores product stock when order is not CANCELLED', async () => {
    const fakeProduct = {
      id: 10,
      stock: 5,
      update: jest.fn().mockResolvedValue(true)
    };
    models.Product.findByPk.mockResolvedValue(fakeProduct);
    const mockOrder = {
      id: 1,
      status: 'PENDING',
      OrderItems: [{ product_id: 10, quantity: 3 }],
      destroy: jest.fn().mockResolvedValue(true)
    };
    models.Order.findByPk.mockResolvedValue(mockOrder);

    const res = makeResponse();
    await controller.deleteOrder({ params: { id: 1 } }, res);

    expect(fakeProduct.update).toHaveBeenCalledWith(
      { stock: 8, isAvailable: true },
      expect.any(Object)
    );
    expect(mockOrder.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Xóa đơn hàng thành công" });
  });

  test('WB-ORD-42: payAllOrdersByTable updates existing payment record when created is false', async () => {
    const mockPaymentRecord = { update: jest.fn().mockResolvedValue(true) };
    models.Payment.findOrCreate.mockResolvedValue([mockPaymentRecord, false]);
    models.Order.findAll.mockResolvedValue([
      { id: 1, status: 'READY', finalPrice: 100000, update: jest.fn().mockResolvedValue(true) }
    ]);
    models.Order.update.mockResolvedValue([1]);
    models.RestaurantTable.update.mockResolvedValue([1]);
    models.Reservation.update.mockResolvedValue([0]);

    const res = makeResponse();
    await controller.payAllOrdersByTable({ params: { tableId: 1 }, body: { paymentMethod: 'CASH' } }, res);

    expect(mockPaymentRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100000, status: 'SUCCESS' }),
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Đã thanh toán thành công 1 đơn hàng." });
  });

  test('WB-ORD-43: payOrder updates existing payment record when created is false', async () => {
    const mockPaymentRecord = { update: jest.fn().mockResolvedValue(true) };
    models.Payment.findOrCreate.mockResolvedValue([mockPaymentRecord, false]);
    const mockOrder = {
      id: 1,
      status: 'READY',
      paymentStatus: 'UNPAID',
      finalPrice: 50000,
      table_id: 1,
      user_id: 2,
      update: jest.fn().mockResolvedValue(true)
    };
    models.Order.findByPk.mockResolvedValue(mockOrder);
    models.RestaurantTable.update.mockResolvedValue([1]);
    models.Reservation.update.mockResolvedValue([0]);
    models.PointHistory.create.mockResolvedValue({});
    models.User.findByPk.mockResolvedValue({ id: 2, point: 0, update: jest.fn().mockResolvedValue(true) });

    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: { paymentMethod: 'CASH' } }, res);

    expect(mockPaymentRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50000, status: 'SUCCESS' }),
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán thành công. Bàn hiện đã sẵn sàng." });
  });

  test('WB-ORD-44: updateOrderStatus with CANCELLED restores stock of OrderItems', async () => {
    const fakeProduct = {
      id: 5,
      name: 'Bún bò',
      stock: 4,
      update: jest.fn().mockResolvedValue(true)
    };
    models.Product.findByPk.mockResolvedValue(fakeProduct);

    const mockOrder = {
      id: 10,
      status: 'PENDING',
      OrderItems: [{ product_id: 5, quantity: 2 }],
      update: jest.fn().mockResolvedValue(true)
    };
    models.Order.findByPk.mockResolvedValue(mockOrder);

    const res = makeResponse();
    await controller.updateOrderStatus({ params: { id: 10 }, body: { status: 'CANCELLED' } }, res);

    expect(fakeProduct.update).toHaveBeenCalledWith(
      { stock: 6, isAvailable: true },
      expect.any(Object)
    );
    expect(mockOrder.update).toHaveBeenCalledWith(
      { status: 'CANCELLED' },
      expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Cập nhật trạng thái thành công",
      data: mockOrder
    });
  });
});


