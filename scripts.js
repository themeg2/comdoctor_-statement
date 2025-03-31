// 현재 날짜를 입력 필드의 기본값으로 설정
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD 형식
    document.getElementById('date-input').value = formattedDate;
    
    // 모달 창 관련 요소 추가
    setupModal();
});

// 모달 창 설정 함수
function setupModal() {
    // 모달 오버레이 및 컨테이너 생성
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'report-modal';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        document.getElementById('report-modal').style.display = 'none';
    };
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.id = 'modal-body';
    
    // 요소 조립
    modalContainer.appendChild(closeButton);
    modalContainer.appendChild(modalBody);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.getElementById('report-modal').style.display = 'none';
        }
    });
    
    // 모달 외부 클릭시 닫기
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
}

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
    
    // 모달 내용 초기화 및 표시
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    
    // 점검 내역서 내용 생성
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';
    reportContainer.style.display = 'block';
    
    const reportContent = document.createElement('div');
    reportContent.className = 'report-content';
    
    // 제목
    const reportTitle = document.createElement('div');
    reportTitle.className = 'report-title';
    reportTitle.textContent = '점검내역서';
    reportContent.appendChild(reportTitle);
    
    
    // 업체 정보 테이블 개선
    const businessTableHTML = `
    <div class="business-table-container">
        <div class="business-header">
            <div class="business-logo">
                <div class="logo-placeholder">W</div>
                <h2 class="business-name">웰컴 컴퓨터 수리</h2>
            </div>
            <div class="business-stamp">
                <div class="representative">대표자: 최성현</div>
                <img id="seal-image" class="official-seal" alt="도장" src="dojang.png">
            </div>
        </div>
        
        <div class="business-info-grid">
            <div class="business-info-item">
                <span class="info-label">등록번호</span>
                <span class="info-value">876-13-01105</span>
            </div>
            <div class="business-info-item">
                <span class="info-label">전화번호</span>
                <span class="info-value">070-7642-7624</span>
            </div>
            <div class="business-info-item">
                <span class="info-label">업태</span>
                <span class="info-value">서비스업</span>
            </div>
            <div class="business-info-item">
                <span class="info-label">종목</span>
                <span class="info-value">컴퓨터수리, 데이터복구</span>
            </div>
            <div class="business-info-item full-width">
                <span class="info-label">주소</span>
                <span class="info-value">부산시 연제구 연미로 13번길 32, 3층 301호 (연산동)</span>
            </div>
        </div>
    </div>
    `;

    const businessTableDiv = document.createElement('div');
    businessTableDiv.innerHTML = businessTableHTML;
    reportContent.appendChild(businessTableDiv.firstElementChild);
    
    const customerInfoHTML = `
    <div class="customer-info">
        <p><strong>점검일:</strong> <span id="current-date">${formattedDate}</span></p>
        <p><strong>고객명:</strong> <span id="customer-name">${customerName}</span> 님</p>
    </div>
    `;
    
    const customerInfoDiv = document.createElement('div');
    customerInfoDiv.innerHTML = customerInfoHTML;
    reportContent.appendChild(customerInfoDiv.firstElementChild);
    
    // 진단 점검 내역서 추가 (고객명 아래, 점검 항목 위에 배치)
    const serviceExplanationHTML = `
    <div class="service-description">
        <h3 class="service-title">진단 점검 내역서</h3>
        
        <p class="service-intro">
        고객님의 컴퓨터를 위해 <span class="highlight">전문 기술력을 활용한 정밀 진단</span>을 
        완료했습니다. 아래와 같은 전문 진단 과정이 수행되었습니다.
        </p>
        
        <ul class="service-points">
        <li class="service-point">
            <span class="bullet">•</span>
            <div class="point-content">
            <div class="point-title">정밀 장비 검사: </div>
            <div class="point-description">
                일반 진단툴로는 확인 불가능한 하드웨어 상태를 전문 장비로 진단 완료
            </div>
            </div>
        </li>
        
        <li class="service-point">
            <span class="bullet">•</span>
            <div class="point-content">
            <div class="point-title">2시간 이상 심층 테스트: </div>
            <div class="point-description">
                장시간 스트레스 테스트와 안정성 검사를 통한 잠재적 문제 식별
            </div>
            </div>
        </li>
        
        <li class="service-point">
            <span class="bullet">•</span>
            <div class="point-content">
            <div class="point-title">숙련된 기술자 진단: </div>
            <div class="point-description">
                10년 이상 경력의 전문 기술자가 직접 수행한 고급 진단 서비스
            </div>
            </div>
        </li>
        
        <li class="service-point">
            <span class="bullet">•</span>
            <div class="point-content">
            <div class="point-title">정확한 원인 파악: </div>
            <div class="point-description">
                문제의 정확한 원인과 필요한 해결책을 명확히 제시
            </div>
            </div>
        </li>
        </ul>
        
        <div class="service-conclusion">
        <p class="conclusion-content">
            고객님께서 수리 진행을 원치 않으시더라도, 아래와 같은 <span class="highlight">진단 서비스</span>가 
            완료되었습니다. 본 진단은 일반 수리점에서 제공하는 기본 점검과는 다른 
            <span class="highlight">종합적인 전문 검사</span>로, 정상적인 점검료가 발생합니다. 
            정확한 원인 파악을 위해 투입된 <span class="highlight">시간, 장비, 전문성</span>에 대한 비용입니다.
            <span class="highlight">재수리를 원하실 경우</span>, 기존에 진단된 내용을 바탕으로 수리를 진행할 수 있으며, <span class="highlight">점검비</span>는 추가되지 않습니다.
        </p>
        </div>
        
        <div class="expertise-section">
        웰컴 컴퓨터 수리: 20년 전통의 컴퓨터 전문 수리점 / 공식 AS점 인증 업체
        </div>
    </div>
    `;
    
    const serviceValueSection = document.createElement('div');
    serviceValueSection.innerHTML = serviceExplanationHTML;
    reportContent.appendChild(serviceValueSection.firstElementChild);
    
    // 테이블 컨테이너
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    // 점검 항목 테이블
    const reportItemsTable = document.createElement('table');
    reportItemsTable.className = 'report-items';
    
    // 테이블 헤더
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th width="25%">점검 항목</th>
            <th width="55%">세부 내용</th>
            <th width="20%">금액</th>
        </tr>
    `;
    reportItemsTable.appendChild(tableHeader);
    
    // 테이블 본문
    const tableBody = document.createElement('tbody');
    tableBody.id = 'report-items-body';
    
    // 점검 항목 추가
    let totalAmount = 0;
    let itemCount = 0;
    
    // 출장비 추가
    if (visitChecked) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="vertical-align: middle;">출장비</td>
            <td style="vertical-align: middle;">현장 방문 서비스</td>
            <td style="vertical-align: middle;">${visitPrice.toLocaleString()}원</td>
        `;
        tableBody.appendChild(tr);
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
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="vertical-align: middle;">${category.name}</td>
                <td style="vertical-align: middle;">${detailsHtml}</td>
                <td style="vertical-align: middle;">${category.price.toLocaleString()}원</td>
            `;
            tableBody.appendChild(tr);
            totalAmount += category.price;
            itemCount++;
        }
    }
    
    reportItemsTable.appendChild(tableBody);
    tableContainer.appendChild(reportItemsTable);

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
    
    const emptySpace = document.createElement('div');
    emptySpace.className = 'empty-space';
    emptySpace.style.minHeight = emptySpaceHeight;
    tableContainer.appendChild(emptySpace);
    
    // 세금 정보 추가
    const supplyAmount = totalAmount;
    const taxAmount = Math.round(totalAmount * 0.1);
    const totalWithTax = supplyAmount + taxAmount;
    
    // 세금 정보 및 감사인사 부분 업데이트
    const footerInfoHTML = `
        <div class="footer-info">
            <div class="tax-info">
                <table class="tax-table">
                    <tr class="tax-header">
                        <th colspan="2">금액 정보</th>
                    </tr>
                    <tr>
                        <td width="70%"><strong>공급가액:</strong></td>
                        <td width="30%" class="amount">${supplyAmount.toLocaleString()}원</td>
                    </tr>
                    <tr>
                        <td><strong>부가세(10%):</strong></td>
                        <td class="amount">${taxAmount.toLocaleString()}원</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>총 금액:</strong></td>
                        <td class="total-amount">${totalWithTax.toLocaleString()}원</td>
                    </tr>
                </table>
                
                <div class="tax-note">
                    <p>※ 부가가치세는 부가가치세법에 따라 재화 및 용역의 공급에 부과되는 세금으로, 
                    최종 소비자가 부담하는 간접세입니다.<br>※ 사업자는 이를 대신 수납하여 국가에 납부합니다.</p>
                </div>
            </div>
            
            <div class="payment-info">
                <div class="account-info">
                    <p class="info-title">입금 계좌 정보</p>
                    <p class="account-number">기업은행 093-149055-04-014 (최성현)</p>
                </div>
                
                <div class="receipt-info">
                    <p class="info-title">현금영수증 및 세금계산서 발급 안내</p>
                    <ul>
                        <li>현금 결제 시 현금영수증 발급 가능합니다.</li>
                        <li>세금계산서는 현금결제 시 발급 가능합니다.</li>
                        <li>세금계산서는 전자 세금 계산서로 발급됩니다.</li>
                    </ul>
                </div>
            </div>
            
            <div class="stamp">
                <p class="thanks-message">서비스를 이용해 주셔서 감사합니다.</p>
            </div>
        </div>
    `;
    
    const footerInfoDiv = document.createElement('div');
    footerInfoDiv.innerHTML = footerInfoHTML;
    tableContainer.appendChild(footerInfoDiv.firstElementChild);
    
    reportContent.appendChild(tableContainer);
    reportContainer.appendChild(reportContent);
    
    // 저장 버튼 추가
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = '저장하기';
    saveButton.onclick = saveToPrint;
    reportContainer.appendChild(saveButton);
    
    // 모달에 추가
    modalBody.appendChild(reportContainer);
    
    // 모달 표시
    document.getElementById('report-modal').style.display = 'block';
}

// 함수: 세부 항목 가져오기
function getDetailItems(itemsName) {
    const items = document.getElementsByName(itemsName);
    const details = [];
    
    items.forEach(item => {
        if (item.checked) {
            details.push(item.parentElement.textContent.trim());
        }
    });
    
    return details;
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