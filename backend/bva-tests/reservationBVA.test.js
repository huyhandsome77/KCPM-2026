const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
};

jest.mock('../src/models', () => ({

    Reservation: {

        findAll: jest.fn(),

        findByPk: jest.fn(),

        create: jest.fn(),

        findOne: jest.fn()

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


const createMockResponse = () => {

    const res = {};

    res.status =
        jest.fn().mockReturnValue(res);

    res.json =
        jest.fn().mockReturnValue(res);

    return res;

};


const createTransaction = () => ({

    commit: jest.fn(),

    rollback: jest.fn()

});



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



describe('RESERVATION BVA TEST SUITE', () => {


    let req;

    let res;

    let next;

    let transaction;



    const FIXED_NOW =
        new Date('2026-09-05T10:00:00.000Z');



    beforeEach(() => {


        jest.clearAllMocks();



        jest.useFakeTimers();

        jest.setSystemTime(FIXED_NOW);



        req = {

            params: {},

            body: {}

        };


        res = createMockResponse();



        next = jest.fn();



        transaction = createTransaction();


        sequelize.transaction
            .mockResolvedValue(transaction);



        sequelize.col.mockImplementation(
            value => value
        );


        sequelize.literal.mockImplementation(
            value => value
        );


        sequelize.fn.mockImplementation(
            (...args) => args
        );


        sequelize.where.mockImplementation(
            (...args) => args
        );

    });


    afterEach(() => {

        jest.useRealTimers();

    });


    describe(
        'STANDARD BVA - CHECK-IN TIME (4n+1)',
        () => {


            test(
                'BVA-01: should allow check-in exactly 30 minutes before reservation time',
                async () => {



                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            + 30 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        reservation.status
                    ).toBe(
                        'CHECKED_IN'
                    );


                    expect(
                        reservation.save
                    ).toHaveBeenCalled();


                    expect(
                        RestaurantTable.update
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        transaction.rollback
                    ).not.toHaveBeenCalled();


                    expect(
                        res.json
                    ).toHaveBeenCalledWith({

                        message:
                            'Xác nhận nhận bàn thành công'

                    });

                }

            );



            test(
                'BVA-02: should allow check-in 29 minutes before reservation time',
                async () => {


                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            + 29 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        reservation.status
                    ).toBe(
                        'CHECKED_IN'
                    );


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        res.status
                    ).not.toHaveBeenCalledWith(
                        400
                    );

                }

            );


            test(
                'BVA-03: should allow check-in exactly at reservation time',
                async () => {


                    const reservation =
                        createMockReservation({

                            reservationTime:
                                FIXED_NOW

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        reservation.status
                    ).toBe(
                        'CHECKED_IN'
                    );


                    expect(
                        reservation.save
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        transaction.rollback
                    ).not.toHaveBeenCalled();

                }

            );


            test(
                'BVA-04: should allow check-in 29 minutes after reservation time',
                async () => {


                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            - 29 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        reservation.status
                    ).toBe(
                        'CHECKED_IN'
                    );


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        transaction.rollback
                    ).not.toHaveBeenCalled();

                }

            );



            test(
                'BVA-05: should allow check-in exactly 30 minutes after reservation time',
                async () => {


                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            - 30 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        reservation.status
                    ).toBe(
                        'CHECKED_IN'
                    );


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        res.json
                    ).toHaveBeenCalledWith({

                        message:
                            'Xác nhận nhận bàn thành công'

                    });

                }

            );


        }

    );



    describe(
        'ROBUST BVA - OUTSIDE CHECK-IN BOUNDARY',
        () => {

            test(
                'RBVA-01: should reject check-in 31 minutes before reservation time',
                async () => {


                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            + 31 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        transaction.rollback
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).not.toHaveBeenCalled();


                    expect(
                        reservation.status
                    ).toBe(
                        'CONFIRMED'
                    );


                    expect(
                        res.status
                    ).toHaveBeenCalledWith(
                        400
                    );


                    expect(
                        res.json
                    ).toHaveBeenCalledWith({

                        message:
                            'Chỉ có thể nhấn nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn!'

                    });

                }

            );



            test(
                'RBVA-02: should reject check-in 31 minutes after reservation time',
                async () => {


                    const reservationTime =
                        new Date(
                            FIXED_NOW.getTime()
                            - 31 * 60 * 1000
                        );


                    const reservation =
                        createMockReservation({

                            reservationTime

                        });


                    Reservation.findByPk
                        .mockResolvedValue(
                            reservation
                        );


                    await reservationController.checkIn(

                        {
                            params: {
                                id: 1
                            }
                        },

                        res,

                        next

                    );


                    expect(
                        transaction.rollback
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).not.toHaveBeenCalled();


                    expect(
                        reservation.status
                    ).toBe(
                        'CONFIRMED'
                    );


                    expect(
                        res.status
                    ).toHaveBeenCalledWith(
                        400
                    );


                    expect(
                        res.json
                    ).toHaveBeenCalledWith({

                        message:
                            'Chỉ có thể nhấn nhận bàn trong khoảng 30 phút trước hoặc 30 phút sau giờ đặt bàn!'

                    });

                }

            );


        }

    );



    describe(
        'CONDITIONAL BOUNDARY - TABLE CAPACITY',
        () => {


            const availableTable = {

                id: 1,

                tableNumber: 1,

                capacity: 4

            };


            beforeEach(() => {



                Reservation.findAll
                    .mockResolvedValue([]);


            });


            test(
                'CAP-01: should accept 3 guests for table capacity 4',
                async () => {


                    RestaurantTable.findOne
                        .mockResolvedValue(
                            availableTable
                        );


                    const createdReservation = {

                        id: 1,

                        toJSON:
                            jest.fn().mockReturnValue({

                                id: 1,

                                numberOfGuests: 3

                            })

                    };


                    Reservation.create
                        .mockResolvedValue(
                            createdReservation
                        );


                    await reservationController.createReservation(

                        {

                            body: {

                                guestName:
                                    'Nguyen Van A',

                                guestPhone:
                                    '0900000000',

                                reservationTime:
                                    '2026-10-01T10:00:00',

                                numberOfGuests:
                                    3

                            }

                        },

                        res,

                        next

                    );


                    expect(
                        Reservation.findAll
                    ).toHaveBeenCalled();


                    expect(
                        RestaurantTable.findOne
                    ).toHaveBeenCalled();


                    expect(
                        Reservation.create
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        transaction.rollback
                    ).not.toHaveBeenCalled();


                    expect(
                        res.status
                    ).toHaveBeenCalledWith(
                        201
                    );


                }

            );



            test(
                'CAP-02: should accept exactly 4 guests for table capacity 4',
                async () => {


                    RestaurantTable.findOne
                        .mockResolvedValue(
                            availableTable
                        );


                    const createdReservation = {

                        id: 2,

                        toJSON:
                            jest.fn().mockReturnValue({

                                id: 2,

                                numberOfGuests: 4

                            })

                    };


                    Reservation.create
                        .mockResolvedValue(
                            createdReservation
                        );


                    await reservationController.createReservation(

                        {

                            body: {

                                guestName:
                                    'Nguyen Van B',

                                guestPhone:
                                    '0900000001',

                                reservationTime:
                                    '2026-10-01T10:00:00',

                                numberOfGuests:
                                    4

                            }

                        },

                        res,

                        next

                    );


                    expect(
                        RestaurantTable.findOne
                    ).toHaveBeenCalled();


                    expect(
                        Reservation.create
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).toHaveBeenCalled();


                    expect(
                        res.status
                    ).toHaveBeenCalledWith(
                        201
                    );


                }

            );


            test(
                'CAP-03: should reject 5 guests when no suitable table is available',
                async () => {


                    RestaurantTable.findOne
                        .mockResolvedValue(
                            null
                        );


                    await reservationController.createReservation(

                        {

                            body: {

                                guestName:
                                    'Nguyen Van C',

                                guestPhone:
                                    '0900000002',

                                reservationTime:
                                    '2026-10-01T10:00:00',

                                numberOfGuests:
                                    5

                            }

                        },

                        res,

                        next

                    );


                    expect(
                        Reservation.findAll
                    ).toHaveBeenCalled();


                    expect(
                        RestaurantTable.findOne
                    ).toHaveBeenCalled();


                    expect(
                        Reservation.create
                    ).not.toHaveBeenCalled();


                    expect(
                        transaction.rollback
                    ).toHaveBeenCalled();


                    expect(
                        transaction.commit
                    ).not.toHaveBeenCalled();


                    expect(
                        res.status
                    ).toHaveBeenCalledWith(
                        400
                    );


                    expect(
                        res.json
                    ).toHaveBeenCalledWith({

                        message:
                            'Rất tiếc, hiện tại không còn bàn trống phù hợp với số lượng khách và khung giờ bạn yêu cầu. Vui lòng chọn khung giờ khác!'

                    });


                }

            );


        }

    );


});