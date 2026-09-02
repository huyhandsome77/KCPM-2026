const models = require('../src/models');
const controller = require('../src/controllers/orderController');

jest.mock('../src/models', () => ({
  Order: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  OrderItem: { bulkCreate: jest.fn() },
  Product: { findByPk: jest.fn() },
  RestaurantTable: { update: jest.fn() },
  User: { findByPk: jest.fn() },
  Reservation: { update: jest.fn() },
  sequelize: { transaction: jest.fn() }
}));

const makeResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeTransaction = () => ({ commit: jest.fn(), rollback: jest.fn() });

beforeAll(() => {
  // Silence console logs and errors during test execution
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  models.sequelize.transaction.mockResolvedValue(makeTransaction());
  models.OrderItem.bulkCreate.mockResolvedValue([]);
  models.RestaurantTable.update.mockResolvedValue([1]);
  models.Reservation.update.mockResolvedValue([1]);
});

// =========================================================================
// 1. STANDARD BVA TEST CASES (Công thức 4n + 1 = 13 Test Cases, n = 3)
// Variables: quantity (1..10), used_points (0..100), price (10..1000)
// =========================================================================
describe('1. STANDARD BVA TEST CASES (4n + 1 = 13 TCs)', () => {
  test('TC_BVA_BASE: All variables at Nominal (quantity=5, used_points=50, price=100)', async () => {
    const product = { id: 1, name: 'Dish', price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    const createdOrder = { id: 10 };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue(createdOrder);
    models.Order.findByPk.mockResolvedValue(createdOrder);

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 50 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 500, discountAmount: 50, finalPrice: 450 }), expect.any(Object));
  });

  test('TC_BVA_Q_01: quantity = Min (1), used_points=50, price=100', async () => {
    const product = { id: 1, name: 'Dish', price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 100, discountAmount: 50, finalPrice: 50 }), expect.any(Object));
  });

  test('TC_BVA_Q_02: quantity = Min+ (2), used_points=50, price=100', async () => {
    const product = { id: 1, name: 'Dish', price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 2 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 200, discountAmount: 50, finalPrice: 150 }), expect.any(Object));
  });

  test('TC_BVA_Q_03: quantity = Max- (9), used_points=50, price=100', async () => {
    const product = { id: 1, name: 'Dish', price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 9 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 900, discountAmount: 50, finalPrice: 850 }), expect.any(Object));
  });

  test('TC_BVA_Q_04: quantity = Max (10), used_points=50, price=100', async () => {
    const product = { id: 1, name: 'Dish', price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 10 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 1000, discountAmount: 50, finalPrice: 950 }), expect.any(Object));
  });

  test('TC_BVA_P_01: used_points = Min (0), quantity=5, price=100', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 0, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 500, discountAmount: 0, finalPrice: 500 }), expect.any(Object));
  });

  test('TC_BVA_P_02: used_points = Min+ (1), quantity=5, price=100', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 1, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 99 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 500, discountAmount: 1, finalPrice: 499 }), expect.any(Object));
  });

  test('TC_BVA_P_03: used_points = Max- (99), quantity=5, price=100', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 99, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 1 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 500, discountAmount: 99, finalPrice: 401 }), expect.any(Object));
  });

  test('TC_BVA_P_04: used_points = Max (100), quantity=5, price=100', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 100, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 0 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 500, discountAmount: 100, finalPrice: 400 }), expect.any(Object));
  });

  test('TC_BVA_S_01: product price = Min (10), quantity=5, used_points=50', async () => {
    const product = { id: 1, price: 10 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 50, discountAmount: 50, finalPrice: 0 }), expect.any(Object));
  });

  test('TC_BVA_S_02: product price = Min+ (20), quantity=5, used_points=50', async () => {
    const product = { id: 1, price: 20 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 100, discountAmount: 50, finalPrice: 50 }), expect.any(Object));
  });

  test('TC_BVA_S_03: product price = Max- (900), quantity=5, used_points=50', async () => {
    const product = { id: 1, price: 900 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 4500, discountAmount: 50, finalPrice: 4450 }), expect.any(Object));
  });

  test('TC_BVA_S_04: product price = Max (1000), quantity=5, used_points=50', async () => {
    const product = { id: 1, price: 1000 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 5 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 5000, discountAmount: 50, finalPrice: 4950 }), expect.any(Object));
  });
});

// =========================================================================
// 2. WHITE-BOX TEST CASES FOR ORDER CONTROLLER (TC_WB_01 -> TC_WB_25)
// =========================================================================
describe('2. WHITE-BOX TEST CASES (ORDER CONTROLLER)', () => {
  test('TC_WB_01: items missing or empty array', async () => {
    const res = makeResponse();
    await controller.createOrder({ body: { items: [] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng phải có ít nhất một món ăn" });
  });

  test('TC_WB_02: items is null or undefined', async () => {
    const res = makeResponse();
    await controller.createOrder({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng phải có ít nhất một món ăn" });
  });

  test('TC_WB_03: Product not found by ID throws error and rolls back', async () => {
    models.Product.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.createOrder({ body: { items: [{ product_id: 999, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Sản phẩm với ID 999 không tồn tại" });
  });

  test('TC_WB_04: item with custom note and item without note', async () => {
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

  test('TC_WB_05: user points deduction succeeds when user has enough points', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 10, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 90 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ discountAmount: 10, finalPrice: 90 }), expect.any(Object));
  });

  test('TC_WB_06: user points deduction fails when user points < used_points', async () => {
    const product = { id: 1, price: 100 };
    const user = { id: 1, points: 5, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 10, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Số điểm tích lũy (5) không đủ để áp dụng (10)" });
  });

  test('TC_WB_07: missing user in DB skips points deduction', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(null);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 999 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ discountAmount: 0, finalPrice: 100 }), expect.any(Object));
  });

  test('TC_WB_08: discount greater than totalPrice sets finalPrice to 0', async () => {
    const product = { id: 1, price: 30 };
    const user = { id: 1, points: 100, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 50, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 30, discountAmount: 50, finalPrice: 0 }), expect.any(Object));
  });

  test('TC_WB_09: table_id provided updates table status to OCCUPIED', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ body: { table_id: 5, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'OCCUPIED' }, { where: { id: 5 }, transaction: expect.any(Object) });
  });

  test('TC_WB_10: table_id omitted does not update table status', async () => {
    const product = { id: 1, price: 100 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ body: { table_id: null, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.RestaurantTable.update).not.toHaveBeenCalled();
  });

  test('TC_WB_11: payOrder returns 400 when order is already PAID', async () => {
    models.Order.findByPk.mockResolvedValue({ id: 1, paymentStatus: 'PAID' });
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng này đã được thanh toán trước đó" });
  });

  test('TC_WB_12: payOrder returns 400 when order status is not READY or COMPLETED', async () => {
    models.Order.findByPk.mockResolvedValue({ id: 1, paymentStatus: 'UNPAID', status: 'PREPARING' });
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đơn hàng phải ở trạng thái 'Chờ phục vụ' mới có thể thanh toán" });
  });

  test('TC_WB_13: payOrder successfully pays order with table, frees table and completes reservation', async () => {
    const order = { id: 1, paymentStatus: 'UNPAID', status: 'READY', table_id: 3, update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);

    expect(order.update).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: 'PAID' }), expect.any(Object));
    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'AVAILABLE' }, { where: { id: 3 }, transaction: expect.any(Object) });
    expect(models.Reservation.update).toHaveBeenCalledWith(
      { status: 'COMPLETED' },
      { where: { table_id: 3, status: 'CHECKED_IN' }, transaction: expect.any(Object) }
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán thành công. Bàn hiện đã sẵn sàng." });
  });

  test('TC_WB_14: payOrder successfully pays order without table (takeaway)', async () => {
    const order = { id: 1, paymentStatus: 'UNPAID', status: 'READY', table_id: null, update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.payOrder({ params: { id: 1 }, body: {} }, res);

    expect(order.update).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: 'PAID' }), expect.any(Object));
    expect(models.RestaurantTable.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán thành công. Bàn hiện đã sẵn sàng." });
  });

  test('TC_WB_15: payAllOrdersByTable successfully pays ready orders and frees table', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1, status: 'READY' }, { id: 2, status: 'COMPLETED' }]);
    models.Order.update.mockResolvedValue([2]);
    const res = makeResponse();
    await controller.payAllOrdersByTable({ params: { tableId: 1 }, body: {} }, res);

    expect(models.Order.update).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: 'PAID' }),
      expect.objectContaining({ where: { id: [1, 2] } })
    );
    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'AVAILABLE' }, { where: { id: 1 }, transaction: expect.any(Object) });
    expect(res.json).toHaveBeenCalledWith({ message: "Đã thanh toán thành công 2 đơn hàng." });
  });

  test('TC_WB_16: getAllOrders without query parameters', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = makeResponse();
    await controller.getAllOrders({ query: {} }, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('TC_WB_17: getAllOrders with status and paymentStatus query parameters', async () => {
    models.Order.findAll.mockResolvedValue([]);
    const res = makeResponse();
    await controller.getAllOrders({ query: { status: 'READY', paymentStatus: 'PAID' } }, res);
    expect(models.Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'READY', paymentStatus: 'PAID' }
    }));
  });

  test('TC_WB_18: getOrderById found order returns 200', async () => {
    const order = { id: 1, totalPrice: 100 };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.getOrderById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith(order);
  });

  test('TC_WB_19: getOrderById not found returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.getOrderById({ params: { id: 999 } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('TC_WB_20: updateOrderStatus found order updates status successfully', async () => {
    const order = { id: 1, status: 'PENDING', update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.updateOrderStatus({ params: { id: 1 }, body: { status: 'CONFIRMED' } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật trạng thái thành công", data: order });
  });

  test('TC_WB_21: updateOrderStatus missing order returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.updateOrderStatus({ params: { id: 999 }, body: { status: 'CANCELLED' } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('TC_WB_22: deleteOrder found order destroys successfully', async () => {
    const order = { id: 1, destroy: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.deleteOrder({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Xóa đơn hàng thành công" });
  });

  test('TC_WB_23: deleteOrder missing order returns 404', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.deleteOrder({ params: { id: 999 } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
  });

  test('TC_WB_24: getCurrentOrderByTable returns orders array', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = makeResponse();
    await controller.getCurrentOrderByTable({ params: { tableId: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('TC_WB_25: getMyOrders successfully returns user orders', async () => {
    models.Order.findAll.mockResolvedValue([{ id: 1, user_id: 5 }]);
    const res = makeResponse();
    await controller.getMyOrders({ user: { id: 5 } }, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, user_id: 5 }]);
  });
});
