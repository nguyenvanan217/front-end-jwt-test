import { useMemo } from 'react';

export const useTransactionCalculations = (transactions) => {
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Calculate overdue days
    const calculateOverdueDays = (returnDate) => {
        if (!returnDate) return 0;
        const end = new Date(returnDate);
        const today = new Date();

        // Reset time to 00:00:00
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (today > end) {
            const diffTime = today - end;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        return 0;
    };

    // Calculate fine
    const calculateFine = (returnDate) => {
        const overdueDays = calculateOverdueDays(returnDate);
        return overdueDays * 10000; // 10,000 VND per day
    };

    // Calculate status counts
    const statusCounts = useMemo(() => {
        if (!transactions) return { returned: 0, pending: 0, overdue: 0 };
        return transactions.reduce(
            (acc, transaction) => {
                switch (transaction.status) {
                    case 'Đã trả':
                        acc.returned++;
                        break;
                    case 'Chờ trả':
                        acc.pending++;
                        break;
                    case 'Quá hạn':
                        acc.overdue++;
                        break;
                    default:
                        break;
                }
                return acc;
            },
            { returned: 0, pending: 0, overdue: 0 },
        );
    }, [transactions]);

    // Calculate total overdue days and fine
    const overdueDaysAndFine = useMemo(() => {
        if (!transactions) return { totalDays: 0, totalFine: 0 };
        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.status === 'Quá hạn') {
                    const overdueDays = calculateOverdueDays(transaction.return_date);
                    const fine = calculateFine(transaction.return_date);
                    acc.totalDays += overdueDays;
                    acc.totalFine += fine;
                }
                return acc;
            },
            { totalDays: 0, totalFine: 0 },
        );
    }, [transactions]);

    return {
        formatDate,
        formatCurrency,
        calculateOverdueDays,
        calculateFine,
        statusCounts,
        overdueDaysAndFine,
    };
};
