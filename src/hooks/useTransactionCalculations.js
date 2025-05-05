import { useMemo } from 'react';

export const useTransactionCalculations = (transactions) => {
    // Tính toán số lượng theo trạng thái
    const statusCounts = useMemo(() => {
        if (!transactions) return { returned: 0, pending: 0, overdue: 0 };

        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.status === 'Đã trả') acc.returned++;
                else if (transaction.status === 'Chờ trả') acc.pending++;
                else if (transaction.status === 'Quá hạn') acc.overdue++;
                return acc;
            },
            { returned: 0, pending: 0, overdue: 0 },
        );
    }, [transactions]);

    // Tính số ngày giữa hai ngày
    const calculateDays = (returnDate) => {
        if (!returnDate) return 0;

        const end = new Date(returnDate);
        const today = new Date();

        // Reset time về 00:00:00
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (today > end) {
            const diffTime = today - end;
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
    };

    // Tính tổng ngày quá hạn và tiền phạt
    const overdueDaysAndFine = useMemo(() => {
        if (!transactions) return { totalDays: 0, totalFine: 0 };

        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.status === 'Quá hạn') {
                    const overdueDays = calculateDays(transaction.return_date);
                    acc.totalDays += overdueDays;
                    acc.totalFine += overdueDays * 10000; // 10,000 VND mỗi ngày
                }
                return acc;
            },
            { totalDays: 0, totalFine: 0 },
        );
    }, [transactions]);

    // Tính số ngày quá hạn cho một giao dịch cụ thể
    const calculateOverdueDays = (returnDate) => calculateDays(returnDate);

    // Tính tiền phạt cho một giao dịch cụ thể
    const calculateFine = (returnDate) => {
        const overdueDays = calculateOverdueDays(returnDate);
        return overdueDays * 10000; // 10,000 VND mỗi ngày
    };

    return {
        statusCounts,
        overdueDaysAndFine,
        calculateOverdueDays,
        calculateFine,
    };
};
