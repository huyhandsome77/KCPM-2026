const { RestaurantTable, Reservation, Order } = require('../src/models');
const tableController = require('../src/controllers/tableController');
const { Op } = require('sequelize');

jest.mock('../src/models', () => ({
  RestaurantTable: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Reservation: {
    findOne: jest.fn(),
  },
  Order: {
    findOne: jest.fn(),
  }
}));

describe('White-Box Testing: tableController (100% Coverage Suite)', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. getAllTables
  // =========================================================================
  describe('getAllTables', () => {
    test('[WB-TBL-01] Lấy danh sách bàn với reservation sắp tới (< 30p) và đã quá giờ (waitingAlert = true)', async () => {
      const now = new Date();
      const pastReservationTime = new Date(now.getTime() - 5 * 60000); // 5 phút trước

      const mockTable = {
        id: 1,
        tableNumber: 1,
        status: 'AVAILABLE',
        toJSON: jest.fn(() => ({ id: 1, tableNumber: 1, status: 'AVAILABLE' }))
      };

      RestaurantTable.findAll.mockResolvedValue([mockTable]);
      Reservation.findOne.mockResolvedValue({
        id: 10,
        reservationTime: pastReservationTime,
        status: 'CONFIRMED'
      });
      Order.findOne.mockResolvedValue(null);

      await tableController.getAllTables(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          calculatedStatus: 'BOOKED',
          waitingAlert: true
        })
      ]));
    });

    test('[WB-TBL-02] Lấy danh sách bàn với checked-in reservation (> 1 giờ)', async () => {
      const now = new Date();
      const checkInTime = new Date(now.getTime() - 90 * 60000); // 90 phút trước (1h30p)

      const mockTable = {
        id: 2,
        tableNumber: 2,
        status: 'OCCUPIED',
        toJSON: jest.fn(() => ({ id: 2, tableNumber: 2, status: 'OCCUPIED' }))
      };

      RestaurantTable.findAll.mockResolvedValue([mockTable]);
      Reservation.findOne
        .mockResolvedValueOnce({ // checked-in reservation
          id: 11,
          updated_at: checkInTime,
          numberOfGuests: 4,
          status: 'CHECKED_IN'
        })
        .mockResolvedValueOnce(null); // no confirmed reservation

      Order.findOne.mockResolvedValue(null);

      await tableController.getAllTables(req, res, next);

      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          calculatedStatus: 'OCCUPIED',
          guestCount: 4,
          timeUsed: expect.stringContaining('1h')
        })
      ]));
    });

    test('[WB-TBL-03] Database Exception trong getAllTables -> next(error)', async () => {
      const error = new Error('DB query failed');
      RestaurantTable.findAll.mockRejectedValue(error);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await tableController.getAllTables(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      errSpy.mockRestore();
    });
  });

  // =========================================================================
  // 2. createTable
  // =========================================================================
  describe('createTable', () => {
    test('[WB-TBL-04] Tạo bàn mới thất bại vì trùng số bàn -> 400', async () => {
      req.body = { tableNumber: 5, capacity: 4 };
      RestaurantTable.findOne.mockResolvedValue({ id: 5, tableNumber: 5 });

      await tableController.createTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Bàn #5 đã tồn tại trong hệ thống!' });
    });

    test('[WB-TBL-05] Tạo bàn mới thành công với giá trị mặc định -> 201', async () => {
      req.body = {};
      RestaurantTable.findOne.mockResolvedValue(null);
      RestaurantTable.create.mockResolvedValue({ id: 1, tableNumber: 1, capacity: 4, qrCode: 'T1', status: 'AVAILABLE' });

      await tableController.createTable(req, res, next);

      expect(RestaurantTable.create).toHaveBeenCalledWith({
        tableNumber: 1,
        capacity: 4,
        qrCode: 'T1',
        status: 'AVAILABLE'
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('[WB-TBL-06] Database Exception trong createTable -> next(error)', async () => {
      const error = new Error('Insert error');
      RestaurantTable.findOne.mockRejectedValue(error);

      await tableController.createTable(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 3. updateTable
  // =========================================================================
  describe('updateTable', () => {
    test('[WB-TBL-07] Cập nhật bàn tìm theo tableNumber qua fallback findOne', async () => {
      req.params = { id: 'TBL_9' };
      req.body = { tableNumber: 9, capacity: 6, qrCode: 'T9', status: 'AVAILABLE' };

      const mockTable = {
        id: 9,
        tableNumber: 9,
        capacity: 4,
        qrCode: 'T9_OLD',
        status: 'OCCUPIED',
        update: jest.fn().mockResolvedValue(true)
      };

      RestaurantTable.findByPk.mockResolvedValue(null);
      RestaurantTable.findOne.mockResolvedValue(mockTable);
      Order.findOne.mockResolvedValue(null); // không có active order chưa thanh toán

      await tableController.updateTable(req, res, next);

      expect(mockTable.update).toHaveBeenCalledWith({
        tableNumber: 9,
        capacity: 6,
        qrCode: 'T9',
        status: 'AVAILABLE'
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cập nhật bàn thành công' }));
    });

    test('[WB-TBL-08] Cập nhật bàn không tìm thấy -> 404', async () => {
      req.params = { id: 999 };
      RestaurantTable.findByPk.mockResolvedValue(null);
      RestaurantTable.findOne.mockResolvedValue(null);

      await tableController.updateTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy bàn ăn' });
    });

    test('[WB-TBL-09] Chuyển status sang AVAILABLE nhưng bàn có đơn chưa thanh toán -> 400', async () => {
      req.params = { id: 1 };
      req.body = { status: 'AVAILABLE' };

      const mockTable = { id: 1, tableNumber: 1, update: jest.fn() };
      RestaurantTable.findByPk.mockResolvedValue(mockTable);
      Order.findOne.mockResolvedValue({ id: 101, paymentStatus: 'UNPAID', status: 'SERVING' });

      await tableController.updateTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('chưa thanh toán!')
      }));
    });

    test('[WB-TBL-10] Database Exception trong updateTable -> next(error)', async () => {
      req.params = { id: 1 };
      const error = new Error('Update error');
      RestaurantTable.findByPk.mockRejectedValue(error);

      await tableController.updateTable(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 4. updateTableStatus
  // =========================================================================
  describe('updateTableStatus', () => {
    test('[WB-TBL-11] Cập nhật trạng thái thành công', async () => {
      req.params = { id: 3 };
      req.body = { status: 'OCCUPIED' };

      const mockTable = { id: 3, tableNumber: 3, update: jest.fn().mockResolvedValue(true) };
      RestaurantTable.findByPk.mockResolvedValue(mockTable);

      await tableController.updateTableStatus(req, res, next);

      expect(mockTable.update).toHaveBeenCalledWith({ status: 'OCCUPIED' });
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật trạng thái bàn thành công",
        id: 3,
        status: 'OCCUPIED'
      });
    });

    test('[WB-TBL-12] Cập nhật trạng thái không tìm thấy bàn -> 404', async () => {
      req.params = { id: 99 };
      RestaurantTable.findByPk.mockResolvedValue(null);
      RestaurantTable.findOne.mockResolvedValue(null);

      await tableController.updateTableStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('[WB-TBL-13] Chuyển sang AVAILABLE khi có đơn chưa thanh toán -> 400', async () => {
      req.params = { id: 3 };
      req.body = { status: 'AVAILABLE' };

      const mockTable = { id: 3, tableNumber: 3, update: jest.fn() };
      RestaurantTable.findByPk.mockResolvedValue(mockTable);
      Order.findOne.mockResolvedValue({ id: 55, paymentStatus: 'UNPAID' });

      await tableController.updateTableStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('[WB-TBL-14] Database Exception trong updateTableStatus -> next(error)', async () => {
      req.params = { id: 1 };
      const error = new Error('Status update error');
      RestaurantTable.findByPk.mockRejectedValue(error);

      await tableController.updateTableStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 5. deleteTable
  // =========================================================================
  describe('deleteTable', () => {
    test('[WB-TBL-15] Xóa bàn thành công khi không có đơn hàng dang dở', async () => {
      req.params = { id: 7 };
      const mockTable = {
        id: 7,
        tableNumber: 7,
        destroy: jest.fn().mockResolvedValue(true)
      };
      RestaurantTable.findByPk.mockResolvedValue(mockTable);
      Order.findOne.mockResolvedValue(null);

      await tableController.deleteTable(req, res, next);

      expect(mockTable.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Xóa bàn ăn #7 thành công',
        id: 7
      });
    });

    test('[WB-TBL-16] Xóa bàn không tìm thấy -> 404', async () => {
      req.params = { id: 888 };
      RestaurantTable.findByPk.mockResolvedValue(null);
      RestaurantTable.findOne.mockResolvedValue(null);

      await tableController.deleteTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy bàn ăn với mã này trong hệ thống' });
    });

    test('[WB-TBL-17] Xóa bàn khi có đơn hàng chưa hoàn tất -> 400', async () => {
      req.params = { id: 7 };
      const mockTable = { id: 7, tableNumber: 7, destroy: jest.fn() };
      RestaurantTable.findByPk.mockResolvedValue(mockTable);
      Order.findOne.mockResolvedValue({ id: 200, status: 'SERVING' });

      await tableController.deleteTable(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('chưa hoàn tất!')
      }));
    });

    test('[WB-TBL-18] Database Exception trong deleteTable -> next(error)', async () => {
      req.params = { id: 7 };
      const error = new Error('Delete error');
      RestaurantTable.findByPk.mockRejectedValue(error);

      await tableController.deleteTable(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 6. getTableByQRCode
  // =========================================================================
  describe('getTableByQRCode', () => {
    test('[WB-TBL-19] Tìm bàn qua QRCode hợp lệ', async () => {
      req.params = { qrCode: 'T10' };
      const mockTable = { id: 10, tableNumber: 10, qrCode: 'T10' };
      RestaurantTable.findOne.mockResolvedValue(mockTable);

      await tableController.getTableByQRCode(req, res, next);

      expect(RestaurantTable.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockTable);
    });

    test('[WB-TBL-20] Không tìm thấy bàn qua QRCode -> 404', async () => {
      req.params = { qrCode: 'UNKNOWN_QR' };
      RestaurantTable.findOne.mockResolvedValue(null);

      await tableController.getTableByQRCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy bàn với mã QR hoặc số bàn này" });
    });

    test('[WB-TBL-21] Database Exception trong getTableByQRCode -> next(error)', async () => {
      req.params = { qrCode: 'T1' };
      const error = new Error('QR lookup error');
      RestaurantTable.findOne.mockRejectedValue(error);

      await tableController.getTableByQRCode(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // 7. bulkCreateTables
  // =========================================================================
  describe('bulkCreateTables', () => {
    test('[WB-TBL-22] Dữ liệu gửi lên không phải mảng -> 400', async () => {
      req.body = { tableNumber: 1 };

      await tableController.bulkCreateTables(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Dữ liệu gửi lên phải là một mảng" });
    });

    test('[WB-TBL-23] Nạp danh sách bàn thành công -> 201', async () => {
      req.body = [
        { tableNumber: 1, capacity: 4 },
        { tableNumber: 2, capacity: 6 }
      ];
      RestaurantTable.bulkCreate.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await tableController.bulkCreateTables(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Đã xử lý thành công 2 bàn trong hệ thống"
      }));
    });

    test('[WB-TBL-24] Database Exception trong bulkCreateTables -> 500', async () => {
      req.body = [{ tableNumber: 1 }];
      const error = new Error('Bulk insert failed');
      RestaurantTable.bulkCreate.mockRejectedValue(error);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await tableController.bulkCreateTables(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Lỗi khi nạp dữ liệu bàn"
      }));
      errSpy.mockRestore();
    });
  });
});
