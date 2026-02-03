import { Expense } from './types';

export const sendBackupEmail = (expenses: Expense[]) => {
    console.log('📧 sendBackupEmail 호출됨, 총 데이터:', expenses.length);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    console.log(`📊 당월(${currentYear}년 ${currentMonth + 1}월) 데이터:`, currentMonthExpenses.length, '건');

    if (currentMonthExpenses.length === 0) {
        console.log('⚠️ 당월 데이터가 없어 메일을 보내지 않습니다.');
        return;
    }

    try {
        const dataRows = currentMonthExpenses.map(e => {
            const d = new Date(e.date);
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            let hours = d.getHours();
            const minutes = d.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? '오후' : '오전';
            hours = hours % 12;
            hours = hours ? hours : 12;

            return {
                date: `${year}.${month}.${day} ${ampm} ${hours}:${minutes}`,
                category: e.category,
                amount: e.amount.toLocaleString(),
                workType: e.workType,
                project: e.projectName || '-',
                participants: e.participants || '-',
                remarks: e.remarks || '-'
            };
        });

        // 총액 계산
        const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 간단한 목록 형식 (엑셀 친화적)
        let tableText = '결제일자 / 사용구분 / 금액 / 근무구분 / 감리사업명 / 참석자 / 비고\n';
        tableText += '─'.repeat(80) + '\n';

        dataRows.forEach(row => {
            tableText += `${row.date} / ${row.category} / ${row.amount}원 / ${row.workType} / ${row.project} / ${row.participants} / ${row.remarks}\n`;
        });

        const emailBody = `${currentYear}년 ${currentMonth + 1}월 법인카드 사용내역

총 ${currentMonthExpenses.length}건 | 총액 ${totalAmount.toLocaleString()}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tableText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 위 내용을 복사하여 엑셀에서 사용하세요.
   "/" 기호로 열을 구분할 수 있습니다.

※ ComCard 자동 백업`;

        // <a> 태그로 mailto 링크 생성하고 클릭 (팝업 없음)
        const subject = `[ComCard 백업] ${currentYear}년 ${currentMonth + 1}월 법인카드 내역`;
        const mailtoUrl = `mailto:ggonsajang@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('📬 메일 앱 열기 완료');

    } catch (error) {
        console.error('❌ 백업 이메일 처리 중 오류:', error);
    }
};
