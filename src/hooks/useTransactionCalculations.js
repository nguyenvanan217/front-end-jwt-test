import { useMemo } from 'react';

const TEST_DATE = '2025-05-07';

export const useTransactionCalculations = (transactions) => {
    const statusCounts = useMemo(() => {
        if (!transactions) return { returned: 0, pending: 0, overdue: 0 };

        return transactions.reduce(
            (acc, transaction) => {
                acc[
                    transaction.status === 'Đã trả'
                        ? 'returned'
                        : transaction.status === 'Chờ trả'
                        ? 'pending'
                        : 'overdue'
                ]++;
                return acc;
            },
            { returned: 0, pending: 0, overdue: 0 },
        );
    }, [transactions]);

    const calculateDays = (returnDate) => {
        if (!returnDate) return 0;

        const end = new Date(returnDate);
        const today = new Date(TEST_DATE);

        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (today > end) {
            const diffTime = today - end;
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
    };

    const overdueDaysAndFine = useMemo(() => {
        if (!transactions) return { totalDays: 0, totalFine: 0 };

        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.status === 'Quá hạn') {
                    const overdueDays = calculateDays(transaction.return_date);
                    acc.totalDays += overdueDays;
                    acc.totalFine += overdueDays * 10000;
                }
                return acc;
            },
            { totalDays: 0, totalFine: 0 },
        );
    }, [transactions]);

    const calculateOverdueDays = (returnDate) => calculateDays(returnDate);

    const calculateFine = (returnDate) => {
        const overdueDays = calculateOverdueDays(returnDate);
        return overdueDays * 10000;
    };

    return {
        statusCounts,
        overdueDaysAndFine,
        calculateOverdueDays,
        calculateFine,
    };
};
