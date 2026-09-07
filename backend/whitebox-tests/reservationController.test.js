const { Op } = require('sequelize');

const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
};

jest.mock('../src/models', () => ({
    Reservation: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn()
    },
    RestaurantTable: {
        findOne: jest.fn(),
        update: jest.fn()
    },
    User: {},

    sequelize: {
        transaction: jest.fn(),
        where: jest.fn(),
        fn: jest.fn(),
        col: jest.fn(),
        literal: jest.fn()
    }
}));

const {
    Reservation,
    RestaurantTable,
    sequelize
} = require('../src/models');

const reservationController =
    require('../src/controllers/reservationController');

describe('White-Box Testing: Reservation Controller', () => {

    let req;
    let res;
    let next;

    beforeEach(() => {

        jest.clearAllMocks();

        mockTransaction.commit.mockResolvedValue();
        mockTransaction.rollback.mockResolvedValue();

        sequelize.transaction.mockResolvedValue(mockTransaction);

        sequelize.where.mockReturnValue({});
        sequelize.fn.mockReturnValue({});
        sequelize.col.mockReturnValue({});
        sequelize.literal.mockReturnValue({});

        req = {
            body: {},
            params: {},
            query: {},
            user: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };

        next = jest.fn();
    });


    describe('createReservation', () => {

        test('[WB-RES-01] Tạo đặt bàn thành công khi có bàn phù hợp', async () => {

            req.body = {
                guestName: 'Nguyen Van A',
                guestPhone: '0123456789',
                reservationTime: '2026-08-25T10:00:00',
                numberOfGuests: 4,
                note: 'Gan cua so',
                user_id: 1
            };

            Reservation.findAll.mockResolvedValue([]);

            const mockTable = {
                id: 1,
                tableNumber: 5,
                capacity: 4
            };

            RestaurantTable.findOne.mockResolvedValue(mockTable);

            const mockReservation = {
                toJSON: jest.fn().mockReturnValue({
                    id: 10,
                    table_id: 1,
                    user_id: 1,
                    guestName: 'Nguyen Van A',
                    guestPhone: '0123456789',
                    numberOfGuests: 4,
                    status: 'PENDING'
                })
            };

            Reservation.create.mockResolvedValue(mockReservation);

            await reservationController.createReservation(
                req,
                res,
                next
            );

            expect(sequelize.transaction).toHaveBeenCalled();

            expect(Reservation.findAll).toHaveBeenCalled();

            expect(RestaurantTable.findOne).toHaveBeenCalled();

            expect(Reservation.create).toHaveBeenCalled();

            expect(mockTransaction.commit).toHaveBeenCalled();

            expect(mockTransaction.rollback).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Đặt bàn thành công',
                    data: expect.objectContaining({
                        id: 10,
                        tableNumber: 5
                    })
                })
            );
        });


        test('[WB-RES-02] Không có bàn phù hợp -> trả về 400', async () => {

            req.body = {
                guestName: 'Nguyen Van B',
                guestPhone: '0987654321',
                reservationTime: '2026-08-25T10:00:00',
                numberOfGuests: 10
            };

            Reservation.findAll.mockResolvedValue([]);

            RestaurantTable.findOne.mockResolvedValue(null);

            await reservationController.createReservation(
                req,
                res,
                next
            );

            expect(Reservation.findAll).toHaveBeenCalled();

            expect(RestaurantTable.findOne).toHaveBeenCalled();

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(mockTransaction.commit).not.toHaveBeenCalled();

            expect(Reservation.create).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('không còn bàn trống')
                })
            );
        });


        test('[WB-RES-03] Có bàn đã bị chiếm trong khung giờ đặt', async () => {

            req.body = {
                guestName: 'Nguyen Van C',
                guestPhone: '0912345678',
                reservationTime: '2026-08-25T10:00:00',
                numberOfGuests: 2
            };

            Reservation.findAll.mockResolvedValue([
                { table_id: 1 },
                { table_id: 2 }
            ]);

            const mockTable = {
                id: 3,
                tableNumber: 10,
                capacity: 4
            };

            RestaurantTable.findOne.mockResolvedValue(mockTable);

            const mockReservation = {
                toJSON: jest.fn().mockReturnValue({
                    id: 11,
                    table_id: 3,
                    status: 'PENDING'
                })
            };

            Reservation.create.mockResolvedValue(mockReservation);

            await reservationController.createReservation(
                req,
                res,
                next
            );

            expect(Reservation.findAll).toHaveBeenCalled();

            expect(RestaurantTable.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: expect.objectContaining({
                            [Op.notIn]: [1, 2]
                        })
                    })
                })
            );

            expect(Reservation.create).toHaveBeenCalled();

            expect(mockTransaction.commit).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(201);
        });


        test('[WB-RES-04] Lỗi database khi tạo reservation -> rollback và trả 500', async () => {

            req.body = {
                guestName: 'Test',
                guestPhone: '0123456789',
                reservationTime: '2026-08-25T10:00:00',
                numberOfGuests: 2
            };

            const error = new Error('Database error');

            Reservation.findAll.mockRejectedValue(error);

            jest.spyOn(console, 'error')
                .mockImplementation(() => {});

            await reservationController.createReservation(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Lỗi hệ thống khi đặt bàn',
                error: 'Database error'
            });

            console.error.mockRestore();
        });


        test('[WB-RES-05] Tạo reservation không có user_id -> lưu user_id là null', async () => {

            req.body = {
                guestName: 'Guest',
                guestPhone: '0999999999',
                reservationTime: '2026-08-25T10:00:00',
                numberOfGuests: 2
            };

            Reservation.findAll.mockResolvedValue([]);

            const mockTable = {
                id: 1,
                tableNumber: 1,
                capacity: 4
            };

            RestaurantTable.findOne.mockResolvedValue(mockTable);

            const mockReservation = {
                toJSON: jest.fn().mockReturnValue({
                    id: 20,
                    table_id: 1,
                    user_id: null
                })
            };

            Reservation.create.mockResolvedValue(mockReservation);

            await reservationController.createReservation(
                req,
                res,
                next
            );

            expect(Reservation.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: null
                }),
                expect.objectContaining({
                    transaction: mockTransaction
                })
            );

            expect(mockTransaction.commit).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(201);
        });

    });

    describe('checkIn', () => {

        test('[WB-RES-06] Không tìm thấy reservation -> 404', async () => {

            req.params.id = 999;

            Reservation.findByPk.mockResolvedValue(null);

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Không tìm thấy thông tin đặt bàn'
            });
        });


        test('[WB-RES-07] Trạng thái không hợp lệ để check-in -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: 'CANCELLED'
            });

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(400);
        });


        test('[WB-RES-08] Check-in quá sớm hơn 30 phút -> 400', async () => {

            req.params.id = 1;

            const futureTime =
                new Date(Date.now() + 31 * 60 * 1000);

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: 'PENDING',
                reservationTime: futureTime,
                table_id: 1
            });

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(400);
        });


        test('[WB-RES-09] Check-in quá muộn hơn 30 phút -> 400', async () => {

            req.params.id = 1;

            const pastTime =
                new Date(Date.now() - 31 * 60 * 1000);

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: 'CONFIRMED',
                reservationTime: pastTime,
                table_id: 1
            });

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(400);
        });


        test('[WB-RES-10] Check-in đúng thời gian -> thành công', async () => {

            req.params.id = 1;

            const reservation = {
                id: 1,
                status: 'CONFIRMED',
                reservationTime: new Date(),
                table_id: 2,
                save: jest.fn().mockResolvedValue()
            };

            Reservation.findByPk.mockResolvedValue(
                reservation
            );

            RestaurantTable.update.mockResolvedValue([1]);

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(reservation.status)
                .toBe('CHECKED_IN');

            expect(reservation.save)
                .toHaveBeenCalledWith({
                    transaction: mockTransaction
                });

            expect(RestaurantTable.update)
                .toHaveBeenCalledWith(
                    { status: 'OCCUPIED' },
                    {
                        where: { id: 2 },
                        transaction: mockTransaction
                    }
                );

            expect(mockTransaction.commit)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: 'Xác nhận nhận bàn thành công'
                });
        });


        test('[WB-RES-11] Lỗi khi check-in -> rollback và gọi next(error)', async () => {

            req.params.id = 1;

            const error =
                new Error('Check-in database error');

            Reservation.findByPk.mockRejectedValue(error);

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback)
                .toHaveBeenCalled();

            expect(next)
                .toHaveBeenCalledWith(error);
        });


        test('[WB-RES-12] Check-in khi reservation không có status -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: null
            });

            await reservationController.checkIn(
                req,
                res,
                next
            );

            expect(mockTransaction.rollback)
                .toHaveBeenCalled();

            expect(res.status)
                .toHaveBeenCalledWith(400);
        });

    });


    describe('cancelReservation', () => {

        test('[WB-RES-13] Không tìm thấy reservation -> 404', async () => {

            req.params.id = 999;

            Reservation.findByPk.mockResolvedValue(null);

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(404);
        });


        test('[WB-RES-14] Hủy reservation trạng thái PENDING thành công', async () => {

            req.params.id = 1;

            const reservation = {
                id: 1,
                status: 'PENDING',
                save: jest.fn().mockResolvedValue()
            };

            Reservation.findByPk.mockResolvedValue(
                reservation
            );

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(reservation.status)
                .toBe('CANCELLED');

            expect(reservation.save)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: 'Đã hủy đặt bàn thành công'
                });
        });


        test('[WB-RES-15] Hủy reservation trạng thái CONFIRMED thành công', async () => {

            req.params.id = 1;

            const reservation = {
                id: 1,
                status: 'CONFIRMED',
                save: jest.fn().mockResolvedValue()
            };

            Reservation.findByPk.mockResolvedValue(
                reservation
            );

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(reservation.status)
                .toBe('CANCELLED');

            expect(reservation.save)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalled();
        });


        test('[WB-RES-16] Không thể hủy reservation trạng thái khác -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: 'COMPLETED'
            });

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(400);
        });


        test('[WB-RES-17] Lỗi khi hủy reservation -> gọi next(error)', async () => {

            req.params.id = 1;

            const error =
                new Error('Cancel error');

            Reservation.findByPk.mockRejectedValue(error);

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(next)
                .toHaveBeenCalledWith(error);
        });


        test('[WB-RES-18] Hủy reservation không có status -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: null
            });

            await reservationController.cancelReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(400);
        });

    });

    describe('confirmReservation', () => {

        test('[WB-RES-19] Không tìm thấy reservation -> 404', async () => {

            req.params.id = 999;

            Reservation.findByPk.mockResolvedValue(null);

            await reservationController.confirmReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(404);
        });


        test('[WB-RES-20] Xác nhận reservation PENDING thành CONFIRMED', async () => {

            req.params.id = 1;

            const reservation = {
                id: 1,
                status: 'PENDING',
                save: jest.fn().mockResolvedValue()
            };

            Reservation.findByPk.mockResolvedValue(
                reservation
            );

            await reservationController.confirmReservation(
                req,
                res,
                next
            );

            expect(reservation.status)
                .toBe('CONFIRMED');

            expect(reservation.save)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: 'Xác nhận đặt bàn thành công',
                    data: reservation
                });
        });


        test('[WB-RES-21] Reservation không phải PENDING -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: 'CONFIRMED'
            });

            await reservationController.confirmReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(400);
        });


        test('[WB-RES-22] Lỗi khi xác nhận reservation -> next(error)', async () => {

            req.params.id = 1;

            const error =
                new Error('Confirm error');

            Reservation.findByPk.mockRejectedValue(error);

            await reservationController.confirmReservation(
                req,
                res,
                next
            );

            expect(next)
                .toHaveBeenCalledWith(error);
        });


        test('[WB-RES-23] Xác nhận reservation không có status -> 400', async () => {

            req.params.id = 1;

            Reservation.findByPk.mockResolvedValue({
                id: 1,
                status: null
            });

            await reservationController.confirmReservation(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(400);
        });

    });


    describe('updateReservationStatus', () => {

        test('[WB-RES-24] Cập nhật trạng thái thành công', async () => {

            req.params.id = 1;

            req.body = {
                status: 'completed'
            };

            const reservation = {
                id: 1,
                status: 'PENDING',
                save: jest.fn().mockResolvedValue()
            };

            Reservation.findByPk.mockResolvedValue(
                reservation
            );

            await reservationController.updateReservationStatus(
                req,
                res,
                next
            );

            expect(reservation.status)
                .toBe('COMPLETED');

            expect(reservation.save)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalled();
        });


        test('[WB-RES-25] Không tìm thấy reservation -> 404', async () => {

            req.params.id = 999;

            req.body = {
                status: 'COMPLETED'
            };

            Reservation.findByPk.mockResolvedValue(null);

            await reservationController.updateReservationStatus(
                req,
                res,
                next
            );

            expect(res.status)
                .toHaveBeenCalledWith(404);
        });


        test('[WB-RES-26] Lỗi khi cập nhật -> next(error)', async () => {

            req.params.id = 1;

            req.body = {
                status: 'COMPLETED'
            };

            const error =
                new Error('Update error');

            Reservation.findByPk.mockRejectedValue(error);

            await reservationController.updateReservationStatus(
                req,
                res,
                next
            );

            expect(next)
                .toHaveBeenCalledWith(error);
        });

    });


    describe('getMyReservations', () => {

        test('[WB-RES-27] Lấy danh sách reservation của user thành công', async () => {

            req.user = {
                id: 1
            };

            const reservations = [
                {
                    id: 1,
                    guestName: 'Nguyen Van A'
                }
            ];

            Reservation.findAll.mockResolvedValue(
                reservations
            );

            await reservationController.getMyReservations(
                req,
                res,
                next
            );

            expect(Reservation.findAll)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalledWith(reservations);
        });


        test('[WB-RES-28] Lỗi database -> next(error)', async () => {

            req.user = {
                id: 1
            };

            const error =
                new Error('Database error');

            Reservation.findAll.mockRejectedValue(error);

            await reservationController.getMyReservations(
                req,
                res,
                next
            );

            expect(next)
                .toHaveBeenCalledWith(error);
        });

    });


    describe('getAllReservations', () => {

        test('[WB-RES-29] Lấy toàn bộ reservation thành công', async () => {

            const reservations = [
                {
                    id: 1,
                    guestName: 'Nguyen Van A'
                },
                {
                    id: 2,
                    guestName: 'Nguyen Van B'
                }
            ];

            Reservation.findAll.mockResolvedValue(
                reservations
            );

            await reservationController.getAllReservations(
                req,
                res,
                next
            );

            expect(Reservation.findAll)
                .toHaveBeenCalled();

            expect(res.json)
                .toHaveBeenCalledWith(reservations);
        });


        test('[WB-RES-30] Lỗi database khi lấy toàn bộ reservation -> next(error)', async () => {

            const error =
                new Error('Database error');

            Reservation.findAll.mockRejectedValue(error);

            await reservationController.getAllReservations(
                req,
                res,
                next
            );

            expect(next)
                .toHaveBeenCalledWith(error);
        });

    });

    // =========================================================================
    // BOUNDARY VALUE ANALYSIS (BVA) FOR RESERVATION CONTROLLER
    // =========================================================================
    describe('Boundary Value Analysis (BVA) for Reservation', () => {
        const FIXED_NOW = new Date('2026-09-05T10:00:00.000Z');

        const createMockReservation = ({
            id = 1,
            reservationTime,
            status = 'CONFIRMED',
            table_id = 1
        }) => ({
            id,
            reservationTime,
            status,
            table_id,
            save: jest.fn().mockResolvedValue(true)
        });

        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(FIXED_NOW);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        describe('STANDARD BVA - CHECK-IN TIME (4n+1)', () => {
            test('[BVA-RES-01] Cho phép check-in chính xác 30 phút trước giờ đặt', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() + 30 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(reservation.status).toBe('CHECKED_IN');
                expect(reservation.save).toHaveBeenCalled();
                expect(RestaurantTable.update).toHaveBeenCalled();
                expect(mockTransaction.commit).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({ message: 'Xác nhận nhận bàn thành công' });
            });

            test('[BVA-RES-02] Cho phép check-in 29 phút trước giờ đặt', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() + 29 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(reservation.status).toBe('CHECKED_IN');
                expect(mockTransaction.commit).toHaveBeenCalled();
            });

            test('[BVA-RES-03] Cho phép check-in đúng giờ đặt bàn', async () => {
                const reservation = createMockReservation({ reservationTime: FIXED_NOW });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(reservation.status).toBe('CHECKED_IN');
                expect(mockTransaction.commit).toHaveBeenCalled();
            });

            test('[BVA-RES-04] Cho phép check-in 29 phút sau giờ đặt bàn', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() - 29 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(reservation.status).toBe('CHECKED_IN');
                expect(mockTransaction.commit).toHaveBeenCalled();
            });

            test('[BVA-RES-05] Cho phép check-in chính xác 30 phút sau giờ đặt bàn', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() - 30 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(reservation.status).toBe('CHECKED_IN');
                expect(mockTransaction.commit).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({ message: 'Xác nhận nhận bàn thành công' });
            });
        });

        describe('ROBUST BVA - OUTSIDE CHECK-IN BOUNDARY', () => {
            test('[RBVA-RES-01] Từ chối check-in 31 phút trước giờ đặt bàn', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() + 31 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(mockTransaction.rollback).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Chỉ có thể nhấn nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn!'
                });
            });

            test('[RBVA-RES-02] Từ chối check-in 31 phút sau giờ đặt bàn', async () => {
                const reservationTime = new Date(FIXED_NOW.getTime() - 31 * 60 * 1000);
                const reservation = createMockReservation({ reservationTime });
                Reservation.findByPk.mockResolvedValue(reservation);

                await reservationController.checkIn({ params: { id: 1 } }, res, next);

                expect(mockTransaction.rollback).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Chỉ có thể nhấn nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn!'
                });
            });
        });

        describe('CONDITIONAL BOUNDARY - TABLE CAPACITY', () => {
            const availableTable = { id: 1, tableNumber: 1, capacity: 4 };

            beforeEach(() => {
                Reservation.findAll.mockResolvedValue([]);
            });

            test('[CAP-RES-01] Chấp nhận 3 khách cho bàn sức chứa 4', async () => {
                RestaurantTable.findOne.mockResolvedValue(availableTable);
                const createdReservation = {
                    id: 1,
                    toJSON: jest.fn().mockReturnValue({ id: 1, numberOfGuests: 3 })
                };
                Reservation.create.mockResolvedValue(createdReservation);

                await reservationController.createReservation(
                    { body: { guestName: 'Nguyen Van A', guestPhone: '0900000000', reservationTime: '2026-10-01T10:00:00', numberOfGuests: 3 } },
                    res,
                    next
                );

                expect(res.status).toHaveBeenCalledWith(201);
            });

            test('[CAP-RES-02] Chấp nhận đúng 4 khách cho bàn sức chứa 4', async () => {
                RestaurantTable.findOne.mockResolvedValue(availableTable);
                const createdReservation = {
                    id: 2,
                    toJSON: jest.fn().mockReturnValue({ id: 2, numberOfGuests: 4 })
                };
                Reservation.create.mockResolvedValue(createdReservation);

                await reservationController.createReservation(
                    { body: { guestName: 'Nguyen Van B', guestPhone: '0900000001', reservationTime: '2026-10-01T10:00:00', numberOfGuests: 4 } },
                    res,
                    next
                );

                expect(res.status).toHaveBeenCalledWith(201);
            });

            test('[CAP-RES-03] Từ chối 5 khách khi không có bàn phù hợp', async () => {
                RestaurantTable.findOne.mockResolvedValue(null);

                await reservationController.createReservation(
                    { body: { guestName: 'Nguyen Van C', guestPhone: '0900000002', reservationTime: '2026-10-01T10:00:00', numberOfGuests: 5 } },
                    res,
                    next
                );

                expect(mockTransaction.rollback).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Rất tiếc, hiện tại không còn bàn trống phù hợp với số lượng khách và khung giờ bạn yêu cầu. Vui lòng chọn khung giờ khác!'
                });
            });
        });
    });
});