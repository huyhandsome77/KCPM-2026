const models = require('../src/models');

const mockCreateLink = jest.fn();
const mockGetLinkInfo = jest.fn();

jest.mock('@payos/node', () => {
  return {
    default: class PayOS {
      constructor() {
        this.paymentRequests = {
          create: mockCreateLink,
          getPaymentLinkInformation: mockGetLinkInfo
        };
        this.createPaymentLink = mockCreateLink;
        this.getPaymentLinkInformation = mockGetLinkInfo;
      }
    }
  };
});

const controller = require('../src/controllers/payosController');

jest.mock('../src/models', () => ({
  Order: { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), update: jest.fn() },
  RestaurantTable: { update: jest.fn() },
  Payment: { findOne: jest.fn(), findOrCreate: jest.fn() },
  sequelize: {}
}));

const makeResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => {
  process.env.PAYOS_CLIENT_ID = 'client';
  process.env.PAYOS_API_KEY = 'key';
  process.env.PAYOS_CHECKSUM_KEY = 'checksum';
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
  models.RestaurantTable.update.mockResolvedValue([1]);
});

// =========================================================================
// 3. WHITE-BOX TEST CASES FOR PAYOS CONTROLLER (TC_WB_26 -> TC_WB_35)
// =========================================================================
describe('3. WHITE-BOX TEST CASES (PAYOS CONTROLLER)', () => {
  test('TC_WB_26: createPaymentLink rejects request without orderId and tableId', async () => {
    const res = makeResponse();
    await controller.createPaymentLink({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Thiếu orderId hoặc tableId" });
  });

  test('TC_WB_27: createPaymentLink creates link for single order and updates note with [PAYOS:xxx]', async () => {
    const order = { id: 10, finalPrice: 100, note: 'Ghi chú cũ', update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    mockCreateLink.mockResolvedValue({ checkoutUrl: 'https://payos.test/checkout/10' });

    const res = makeResponse();
    await controller.createPaymentLink({ body: { orderId: 10 } }, res);

    expect(order.update).toHaveBeenCalledWith(
      expect.objectContaining({ note: expect.stringContaining('[PAYOS:') })
    );
    expect(res.json).toHaveBeenCalledWith({ checkoutUrl: 'https://payos.test/checkout/10' });
  });

  test('TC_WB_28: createPaymentLink aggregates multiple orders by tableId into one PayOS link', async () => {
    const order1 = { id: 1, finalPrice: 100, note: null, update: jest.fn().mockResolvedValue() };
    const order2 = { id: 2, finalPrice: 200, note: '', update: jest.fn().mockResolvedValue() };
    models.Order.findAll.mockResolvedValue([order1, order2]);
    mockCreateLink.mockResolvedValue({ checkoutUrl: 'https://payos.test/checkout/table4' });

    const res = makeResponse();
    await controller.createPaymentLink({ body: { tableId: 4 } }, res);

    expect(mockCreateLink).toHaveBeenCalledWith(expect.objectContaining({ amount: 300 }));
    expect(res.json).toHaveBeenCalledWith({ checkoutUrl: 'https://payos.test/checkout/table4' });
  });

  test('TC_WB_29: createPaymentLink handles PayOS exception and returns 500', async () => {
    const order = { id: 10, finalPrice: 100, note: '', update: jest.fn() };
    models.Order.findByPk.mockResolvedValue(order);
    mockCreateLink.mockRejectedValue(new Error('PayOS connection error'));

    const res = makeResponse();
    await controller.createPaymentLink({ body: { orderId: 10 } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Lỗi kết nối PayOS" }));
  });

  test('TC_WB_30: checkOrderStatus returns 404 for missing order', async () => {
    models.Order.findByPk.mockResolvedValue(null);
    const res = makeResponse();
    await controller.checkOrderStatus({ params: { orderId: 999 } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
  });

  test('TC_WB_31: checkOrderStatus returns PAID immediately if already paid in DB', async () => {
    const order = { id: 10, paymentStatus: 'PAID' };
    models.Order.findByPk.mockResolvedValue(order);
    const res = makeResponse();
    await controller.checkOrderStatus({ params: { orderId: 10 } }, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'PAID', message: 'Already paid' });
  });

  test('TC_WB_32: checkOrderStatus updates order and table when PayOS status is PAID', async () => {
    const order = { id: 10, note: '[PAYOS:12345678]', paymentStatus: 'UNPAID', table_id: 2, update: jest.fn().mockResolvedValue() };
    models.Order.findByPk.mockResolvedValue(order);
    mockGetLinkInfo.mockResolvedValue({ status: 'PAID', amount: 500 });
    const res = makeResponse();
    await controller.checkOrderStatus({ params: { orderId: 10 } }, res);
    expect(order.update).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: 'PAID' }));
    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'AVAILABLE' }, { where: { id: 2 } });
  });

  test('TC_WB_33: payosWebhook updates unpaid order and frees table on code 00', async () => {
    const order = { id: 10, paymentStatus: 'UNPAID', table_id: 3, update: jest.fn().mockResolvedValue() };
    models.Order.findOne.mockResolvedValue(order);
    const res = makeResponse();

    await controller.payosWebhook({ body: { code: '00', data: { orderCode: 12345678, amount: 100 } } }, res);

    expect(order.update).toHaveBeenCalledWith(expect.objectContaining({ paymentStatus: 'PAID' }));
    expect(models.RestaurantTable.update).toHaveBeenCalledWith({ status: 'AVAILABLE' }, { where: { id: 3 } });
    expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
  });

  test('TC_WB_34: payosWebhook handles non-00 code safely', async () => {
    const res = makeResponse();
    await controller.payosWebhook({ body: { code: '01', desc: 'Cancelled' } }, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
  });

  test('TC_WB_35: debugPayOS, paymentSuccess, and paymentCancel handlers', async () => {
    const res1 = makeResponse();
    await controller.debugPayOS({}, res1);
    expect(res1.json).toHaveBeenCalledWith(expect.objectContaining({ available: true }));

    const res2 = makeResponse();
    await controller.paymentSuccess({}, res2);
    expect(res2.send).toHaveBeenCalled();

    const res3 = makeResponse();
    await controller.paymentCancel({}, res3);
    expect(res3.send).toHaveBeenCalled();
  });
});
