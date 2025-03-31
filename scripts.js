// 현재 날짜를 입력 필드의 기본값으로 설정
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD 형식
    document.getElementById('date-input').value = formattedDate;
});

// 전체 항목 선택/해제 기능
function selectAllItems(checked) {
    // 출장비 체크박스
    document.getElementById("visit-check").checked = checked;
    
    // 모든 메인 카테고리 체크박스
    const categories = ['cpu', 'mb', 'ram', 'psu', 'gpu'];
    
    categories.forEach(cat => {
        const mainCheckbox = document.getElementById(`${cat}-check`);
        mainCheckbox.checked = checked;
        
        // 서브 항목들 체크/언체크
        checkAllSubItems(`${cat}-items`, checked);
        
        // 세부 항목 표시/숨김
        const details = document.getElementById(`${cat}-details`);
        if (checked) {
            details.style.display = "block";
        } else {
            details.style.display = "none";
        }
    });
}

// 저장하기 기능 (현재는 인쇄 다이얼로그를 통해 PDF로 저장 가능)
function saveToPrint() {
    window.print();
}

// 세부 항목 토글 기능
function toggleDetails(id) {
    const details = document.getElementById(id);
    if (details.style.display === "block") {
        details.style.display = "none";
    } else {
        details.style.display = "block";
    }
}

// 모든 하위 항목 체크/해제 기능
function checkAllSubItems(itemsName, checked) {
    const items = document.getElementsByName(itemsName);
    for (const item of items) {
        item.checked = checked;
    }
}

// 날짜 포맷 함수 (YYYY-MM-DD를 YYYY년 MM월 DD일로 변환)
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
}

// CSS 파일 로드하기
async function loadCSS(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            return await response.text();
        } else {
            console.error('CSS 파일을 불러오는데 실패했습니다:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('CSS 파일을 불러오는데 오류가 발생했습니다:', error);
        return null;
    }
}

// 점검 내역서 생성 함수
function generateReport() {
    // 필요한 모든 데이터 수집
    const customerName = document.getElementById("customer-input").value.trim() || "홍길동";
    const dateInput = document.getElementById("date-input").value;
    const formattedDate = dateInput ? formatDate(dateInput) : formatDate(new Date().toISOString().slice(0, 10));
    
    // 출장비 관련 데이터
    const visitChecked = document.getElementById("visit-check").checked;
    const visitPrice = document.getElementById("visit-price").value ? parseInt(document.getElementById("visit-price").value) : 20000;
    
    // 각 하드웨어 카테고리 체크 여부 및 가격 확인
    const categories = [
        { id: "cpu-check", name: "CPU Performance Check", itemsName: "cpu-items", price: document.getElementById("cpu-price").value ? parseInt(document.getElementById("cpu-price").value) : 10000, details: getDetailItems("cpu-items") },
        { id: "mb-check", name: "Motherboard Diagnostics", itemsName: "mb-items", price: document.getElementById("mb-price").value ? parseInt(document.getElementById("mb-price").value) : 10000, details: getDetailItems("mb-items") },
        { id: "ram-check", name: "Memory (RAM) Testing", itemsName: "ram-items", price: document.getElementById("ram-price").value ? parseInt(document.getElementById("ram-price").value) : 10000, details: getDetailItems("ram-items") },
        { id: "psu-check", name: "Power Supply Unit Check", itemsName: "psu-items", price: document.getElementById("psu-price").value ? parseInt(document.getElementById("psu-price").value) : 10000, details: getDetailItems("psu-items") },
        { id: "gpu-check", name: "Graphics & Display Output Testing", itemsName: "gpu-items", price: document.getElementById("gpu-price").value ? parseInt(document.getElementById("gpu-price").value) : 10000, details: getDetailItems("gpu-items") }
    ];
    
    // 선택된 항목들 확인
    let hasItems = visitChecked || categories.some(cat => document.getElementById(cat.id).checked);
    
    if (!hasItems) {
        alert("적어도 하나의 항목을 선택해주세요.");
        return;
    }
    
    // CSS 가져오기 및 새 창 만들기
    loadCSS('styles.css').then(cssContent => {
        // 새 창 열기
        const reportWindow = window.open('', '_blank', 'width=900,height=650');
        reportWindow.document.write('<html><head><title>컴퓨터 하드웨어 점검 내역서</title>');
        reportWindow.document.write('<style>');
        
        // 가져온 CSS 내용 적용
        if (cssContent) {
            reportWindow.document.write(cssContent);
        } else {
            // CSS를 가져오지 못했을 경우 기본 스타일 적용
            reportWindow.document.write(getBackupStyleContent());
        }
        
        reportWindow.document.write('</style></head><body>');
        
        // 점검 내역서 내용 생성
        reportWindow.document.write('<div class="report-container" style="display: block;">');
        reportWindow.document.write('<div class="report-content">');
        
        // 제목
        reportWindow.document.write('<div class="report-title">점검내역서</div>');
        
        // 업체 정보 테이블
        reportWindow.document.write(`
            <div class="business-table-container">
                <table class="business-table">
                    <tr>
                        <th>등록번호</th>
                        <td colspan="3">876-13-01105</td>
                    </tr>
                    <tr>
                        <th>상 호</th>
                        <td>웰컴 컴퓨터 수리</td>
                        <th>대표자</th>
                        <td class="representative-cell">최성현
                            <img id="seal-image" class="official-seal" alt="도장" src="dojang.png">
                        </td>
                    </tr>
                    <tr>
                        <th>주 소</th>
                        <td colspan="3">부산시 연제구 연미로 13번길 32, 3층 301호 (연산동)</td>
                    </tr>
                    <tr>
                        <th>업 태</th>
                        <td>서비스업</td>
                        <th>종 목</th>
                        <td>컴퓨터수리, 데이터복구</td>
                    </tr>
                    <tr>
                        <th>전 화</th>
                        <td colspan="3">070-7642-7624</td>
                    </tr>
                </table>
            </div>
        `);
        
        // 고객 정보
        reportWindow.document.write(`
            <div class="customer-info">
                <p><strong>점검일:</strong> <span id="current-date">${formattedDate}</span></p>
                <p><strong>고객명:</strong> <span id="customer-name">${customerName}</span> 님</p>
            </div>
        `);
        
        // 점검 항목 테이블 시작
        reportWindow.document.write(`
            <div class="table-container">
                <table class="report-items">
                    <thead>
                        <tr>
                            <th width="25%">점검 항목</th>
                            <th width="55%">세부 내용</th>
                            <th width="20%">금액</th>
                        </tr>
                    </thead>
                    <tbody id="report-items-body">
        `);
        
        // 점검 항목 추가
        let totalAmount = 0;
        let itemCount = 0;
        
        // 출장비 추가
        if (visitChecked) {
            reportWindow.document.write(`
                <tr>
                    <td style="vertical-align: middle;">출장비</td>
                    <td style="vertical-align: middle;">현장 방문 서비스</td>
                    <td style="vertical-align: middle;">${visitPrice.toLocaleString()}원</td>
                </tr>
            `);
            totalAmount += visitPrice;
            itemCount++;
        }
        
        // 각 하드웨어 카테고리 추가
        for (const category of categories) {
            if (document.getElementById(category.id).checked) {
                let detailsHtml = "";
                if (category.details && category.details.length > 0) {
                    detailsHtml = category.details.map(detail => 
                        `<span class="detail-item">- ${detail}</span>`
                    ).join('');
                } else {
                    detailsHtml = "전체 점검";
                }
                
                reportWindow.document.write(`
                    <tr>
                        <td style="vertical-align: middle;">${category.name}</td>
                        <td style="vertical-align: middle;">${detailsHtml}</td>
                        <td style="vertical-align: middle;">${category.price.toLocaleString()}원</td>
                    </tr>
                `);
                totalAmount += category.price;
                itemCount++;
            }
        }
        
        reportWindow.document.write('</tbody></table>');
        
        // 빈 공간 추가
        let emptySpaceHeight = "180px";
        if (itemCount <= 1) {
            emptySpaceHeight = "180px";
        } else if (itemCount <= 2) {
            emptySpaceHeight = "150px";
        } else if (itemCount <= 3) {
            emptySpaceHeight = "120px";
        } else if (itemCount <= 4) {
            emptySpaceHeight = "90px";
        } else if (itemCount <= 5) {
            emptySpaceHeight = "60px";
        } else {
            emptySpaceHeight = "30px";
        }
        
        reportWindow.document.write(`<div class="empty-space" style="min-height: ${emptySpaceHeight};"></div>`);
        
        // 세금 정보 추가
        const supplyAmount = totalAmount;
        const taxAmount = Math.round(totalAmount * 0.1);
        const totalWithTax = supplyAmount + taxAmount;
        
        reportWindow.document.write(`
            <div class="footer-info">
                <div class="tax-info">
                    <table>
                        <tr>
                            <td width="80%"><strong>공급가액:</strong></td>
                            <td width="20%">${supplyAmount.toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td><strong>부가세(10%):</strong></td>
                            <td>${taxAmount.toLocaleString()}원</td>
                        </tr>
                        <tr>
                            <td><strong>총 금액(부가세 포함):</strong></td>
                            <td>${totalWithTax.toLocaleString()}원</td>
                        </tr>
                    </table>
                </div>
                
                <div class="account-info">
                    <p>입금 계좌 정보</p>
                    <p class="account-number">기업은행 093-149055-04-014 (최성현)</p>
                </div>
                
                <div class="stamp">
                    <p>감사합니다.</p>
                </div>
            </div>
        `);
        
        reportWindow.document.write('</div>'); // end of table-container
        reportWindow.document.write('</div>'); // end of report-content
        
        // 저장 버튼 추가
        reportWindow.document.write('<button class="save-button" onclick="window.print()">저장하기</button>');
        
        reportWindow.document.write('</div>'); // end of report-container
        reportWindow.document.write('</body></html>');
        reportWindow.document.close();
    });
}

// 함수: 세부 항목 가져오기
function getDetailItems(itemsName) {
    const items = document.getElementsByName(itemsName);
    const details = [];
    
    items.forEach(item => {
        if (item.checked) {
            details.push(item.parentElement.textContent.split('(')[0].trim());
        }
    });
    
    return details;
}

// 백업 CSS 내용 (CSS 파일을 불러올 수 없을 때 사용)
function getBackupStyleContent() {
    return `
    /* A4 용지 기본 설정 */
    @page {
        size: A4;
        margin: 0;
    }

    body {
        font-family: 'Malgun Gothic', sans-serif;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-size: 12px;
    }

    /* 인쇄용 A4 크기 설정 */
    .report-container {
        display: block;
        width: 210mm;
        min-height: 297mm;
        height: auto;
        margin: 0 auto;
        background: white;
        padding: 15mm;
        box-sizing: border-box;
        position: relative;
    }

    .report-content {
        min-height: 267mm; /* 297mm - 30mm 패딩 */
        display: flex;
        flex-direction: column;
    }

    .report-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
        letter-spacing: 10px;
        padding-left: 10px;
    }

    .business-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
    }

    .customer-info {
        margin-bottom: 15px;
        position: relative;
    }

    .report-items {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        font-size: 11px;
    }

    .report-items th, .report-items td {
        border: 1px solid #ddd;
        padding: 5px;
        white-space: nowrap;
        vertical-align: middle; /* 수직 가운데 정렬 */
    }

    .report-items th {
        background-color: #f2f2f2;
        text-align: center;
        font-size: 11px;
        padding: 6px 4px;
    }

    .report-items td {
        font-size: 11px;
    }

    .report-items td:nth-child(2) {
        white-space: normal;
    }

    .report-items td:first-child, .report-items td:last-child {
        text-align: center; /* 가로 가운데 정렬 */
    }

    .table-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .empty-space {
        flex-grow: 1;
        min-height: 20px;
        border-top: 1px dashed #eee;
        border-bottom: 1px dashed #eee;
        margin: 10px 0;
    }

    .tax-info {
        margin-top: auto;
        border-top: 1px solid #ddd;
        padding-top: 8px;
    }

    .tax-info table {
        width: 100%;
        border-collapse: collapse;
    }

    .tax-info th, .tax-info td {
        padding: 4px;
        text-align: right;
        border: none;
        white-space: nowrap;
        font-size: 11px;
        vertical-align: middle; /* 수직 가운데 정렬 */
    }

    .account-info {
        margin-top: 20px;
        border-top: 1px solid #ddd;
        padding-top: 10px;
        font-size: 11px;
        text-align: center;
    }

    .account-info p {
        margin: 5px 0;
    }

    .account-number {
        font-weight: bold;
        font-size: 12px;
    }

    .footer-info {
        margin-top: auto;
    }

    .stamp {
        text-align: right;
        margin-top: 20px;
        position: relative;
    }

    .stamp p {
        margin: 5px 0;
    }

    .official-seal {
        width: 50px;
        height: 50px;
        position: absolute;
        top: -15px;
        right: 10px;
    }

    .business-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        font-size: 11px;
    }

    .business-table th, .business-table td {
        border: 1px solid #ddd;
        padding: 5px;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle; /* 수직 가운데 정렬 */
    }

    .business-table th {
        background-color: #f2f2f2;
        width: 15%;
    }

    .date-section {
        margin-bottom: 15px;
    }

    .representative-cell {
        position: relative;
        padding-right: 60px !important;
    }

    .detail-item {
        display: block;
        margin-bottom: 3px;
        text-indent: -8px;
        padding-left: 8px;
        font-size: 10px;
        line-height: 1.3;
    }

    .save-button {
        background-color: #2196F3;
        color: white;
        border: none;
        padding: 8px 12px;
        text-align: center;
        text-decoration: none;
        display: block;
        font-size: 14px;
        margin: 4px auto;
        cursor: pointer;
        border-radius: 4px;
        width: 200px;
    }

    @media print {
        .save-button {
            display: none;
        }
    }
    `;
}

// 초기화 - 모든 세부항목 체크박스에 하위 항목 하나라도 체크하면 상위 체크박스도 체크
document.addEventListener('DOMContentLoaded', function() {
    const categories = ['cpu', 'mb', 'ram', 'psu', 'gpu'];
    
    categories.forEach(cat => {
        const items = document.getElementsByName(`${cat}-items`);
        
        items.forEach(item => {
            item.addEventListener('change', function() {
                const mainCheckbox = document.getElementById(`${cat}-check`);
                
                // 하위 항목이 하나라도 체크되어 있으면 상위 체크박스 체크
                let anyChecked = false;
                for (const subItem of items) {
                    if (subItem.checked) {
                        anyChecked = true;
                        break;
                    }
                }
                
                mainCheckbox.checked = anyChecked;
                
                // 상위 체크박스 체크되면 세부 항목 표시
                if (anyChecked && document.getElementById(`${cat}-details`).style.display !== "block") {
                    toggleDetails(`${cat}-details`);
                }
            });
        });
    });
});