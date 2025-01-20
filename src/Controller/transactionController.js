const updateAllOverdueStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm tất cả các transaction chưa trả và đã quá hạn
        const overdueTransactions = await db.Transactions.findAll({
            where: {
                return_date: {
                    [db.Sequelize.Op.lt]: today,
                },
                status: {
                    [db.Sequelize.Op.notIn]: ['Đã trả', 'Quá hạn'],
                },
            },
        });

        if (overdueTransactions.length === 0) {
            return res.status(200).json({
                EM: 'Không có giao dịch nào cần cập nhật',
                EC: 0,
                DT: [], // Trả về mảng rỗng khi không có cập nhật
            });
        }

        // Cập nhật status thành "Quá hạn"
        await db.Transactions.update(
            { status: 'Quá hạn' },
            {
                where: {
                    id: overdueTransactions.map((trans) => trans.id),
                },
            },
        );

        return res.status(200).json({
            EM: `Đã cập nhật ${overdueTransactions.length} giao dịch quá hạn`,
            EC: 0,
            DT: overdueTransactions, // Trả về danh sách các giao dịch đã cập nhật
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EM: 'Có lỗi xảy ra!',
            EC: 1,
            DT: [],
        });
    }
};
