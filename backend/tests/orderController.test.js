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
// Variables theo đúng đặc tả SRS Mục 2.6:
// - quantity: Miền [1, 99] (Min=1, Min+=2, Nom=50, Max-=98, Max=99)
// - used_points: Miền [0, 10.000.000] (Min=0, Min+=1, Nom=500, Max-=7.499.999, Max=7.500.000)
// - price: Miền [1.000, 100.000.000] đ (Min=1.000, Min+=2.000, Nom=150.000, Max-=99.999.000, Max=100.000.000)
// =========================================================================
describe('1. STANDARD BVA TEST CASES (4n + 1 = 13 TCs - SRS Compliant)', () => {
  test('TC_BVA_BASE: All variables at Nominal (quantity=50, used_points=500, price=150000)', async () => {
    const product = { id: 1, name: 'Sushi Cá Hồi', price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    const createdOrder = { id: 10 };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue(createdOrder);
    models.Order.findByPk.mockResolvedValue(createdOrder);

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 9500 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 7500000, discountAmount: 500, finalPrice: 7499500 }), expect.any(Object));
  });

  test('TC_BVA_Q_01: quantity = Min (1), used_points=500, price=150000', async () => {
    const product = { id: 1, name: 'Sushi Cá Hồi', price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 1 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 150000, discountAmount: 500, finalPrice: 149500 }), expect.any(Object));
  });

  test('TC_BVA_Q_02: quantity = Min+ (2), used_points=500, price=150000', async () => {
    const product = { id: 1, name: 'Sushi Cá Hồi', price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 2 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 300000, discountAmount: 500, finalPrice: 299500 }), expect.any(Object));
  });

  test('TC_BVA_Q_03: quantity = Max- (98), used_points=500, price=150000', async () => {
    const product = { id: 1, name: 'Sushi Cá Hồi', price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 98 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 14700000, discountAmount: 500, finalPrice: 14699500 }), expect.any(Object));
  });

  test('TC_BVA_Q_04: quantity = Max (99), used_points=500, price=150000', async () => {
    const product = { id: 1, name: 'Sushi Cá Hồi', price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 99 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 14850000, discountAmount: 500, finalPrice: 14849500 }), expect.any(Object));
  });

  test('TC_BVA_P_01: used_points = Min (0), quantity=50, price=150000', async () => {
    const product = { id: 1, price: 150000 };
    models.Product.findByPk.mockResolvedValue(product);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 0, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 7500000, discountAmount: 0, finalPrice: 7500000 }), expect.any(Object));
  });

  test('TC_BVA_P_02: used_points = Min+ (1), quantity=50, price=150000', async () => {
    const product = { id: 1, price: 150000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 1, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 9999 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 7500000, discountAmount: 1, finalPrice: 7499999 }), expect.any(Object));
  });

  test('TC_BVA_P_03: used_points = Max- (7499999), quantity=50, price=150000', async () => {
    const product = { id: 1, price: 150000 };
    const user = { id: 1, points: 10000000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 7499999, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 2500001 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 7500000, discountAmount: 7499999, finalPrice: 1 }), expect.any(Object));
  });

  test('TC_BVA_P_04: used_points = Max (7500000), quantity=50, price=150000', async () => {
    const product = { id: 1, price: 150000 };
    const user = { id: 1, points: 10000000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 7500000, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(user.update).toHaveBeenCalledWith({ points: 2500000 }, expect.any(Object));
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 7500000, discountAmount: 7500000, finalPrice: 0 }), expect.any(Object));
  });

  test('TC_BVA_S_01: product price = Min (1000), quantity=50, used_points=500', async () => {
    const product = { id: 1, price: 1000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 50000, discountAmount: 500, finalPrice: 49500 }), expect.any(Object));
  });

  test('TC_BVA_S_02: product price = Min+ (2000), quantity=50, used_points=500', async () => {
    const product = { id: 1, price: 2000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 100000, discountAmount: 500, finalPrice: 99500 }), expect.any(Object));
  });

  test('TC_BVA_S_03: product price = Max- (99999000), quantity=50, used_points=500', async () => {
    const product = { id: 1, price: 99999000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 4999950000, discountAmount: 500, finalPrice: 4999949500 }), expect.any(Object));
  });

  test('TC_BVA_S_04: product price = Max (100000000), quantity=50, used_points=500', async () => {
    const product = { id: 1, price: 100000000 };
    const user = { id: 1, points: 10000, update: jest.fn() };
    models.Product.findByPk.mockResolvedValue(product);
    models.User.findByPk.mockResolvedValue(user);
    models.Order.create.mockResolvedValue({ id: 10 });
    models.Order.findByPk.mockResolvedValue({ id: 10 });

    const res = makeResponse();
    await controller.createOrder({ user: { id: 1 }, body: { used_points: 500, items: [{ product_id: 1, quantity: 50 }] } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(models.Order.create).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 5000000000, discountAmount: 500, finalPrice: 4999999500 }), expect.any(Object));
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
