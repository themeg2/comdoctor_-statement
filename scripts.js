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

// 점검 내역서 생성 함수
function generateReport() {
    // 테이블 내용 초기화
    const tbody = document.getElementById("report-items-body");
    tbody.innerHTML = "";
    
    // 입력 필드에서 고객명 가져오기
    const customerName = document.getElementById("customer-input").value.trim() || "홍길동";
    document.getElementById("customer-name").textContent = customerName;
    
    // 입력 필드에서 날짜 가져오기
    const dateInput = document.getElementById("date-input").value;
    const formattedDate = dateInput ? formatDate(dateInput) : formatDate(new Date().toISOString().slice(0, 10));
    document.getElementById("current-date").textContent = formattedDate;
    
    let totalAmount = 0;
    let hasItems = false;
    let itemCount = 0; // 항목 수를 추적
    
    // 출장비 추가
    if (document.getElementById("visit-check").checked) {
        addItemToReport("출장비", "현장 방문 서비스", 20000, tbody);
        totalAmount += 20000;
        hasItems = true;
        itemCount++;
    }
    
    // 각 하드웨어 카테고리 체크 여부 확인
    const categories = [
        { id: "cpu-check", name: "CPU Performance Check", itemsName: "cpu-items", price: 10000, details: getDetailItems("cpu-items") },
        { id: "mb-check", name: "Motherboard Diagnostics", itemsName: "mb-items", price: 10000, details: getDetailItems("mb-items") },
        { id: "ram-check", name: "Memory (RAM) Testing", itemsName: "ram-items", price: 10000, details: getDetailItems("ram-items") },
        { id: "psu-check", name: "Power Supply Unit Check", itemsName: "psu-items", price: 10000, details: getDetailItems("psu-items") },
        { id: "gpu-check", name: "Graphics & Display Output Testing", itemsName: "gpu-items", price: 10000, details: getDetailItems("gpu-items") }
    ];
    
    for (const category of categories) {
        if (document.getElementById(category.id).checked) {
            addCategoryToReport(category.name, category.price, category.details, tbody);
            totalAmount += category.price;
            hasItems = true;
            itemCount++;
        }
    }
    
    // 빈 공간 조정
    adjustEmptySpace(itemCount);
    
    // 공급가액, 부가세, 총액(세금포함) 계산
    const supplyAmount = totalAmount;
    const taxAmount = Math.round(totalAmount * 0.1);
    const totalWithTax = supplyAmount + taxAmount;
    
    document.getElementById("supply-amount").textContent = supplyAmount.toLocaleString() + "원";
    document.getElementById("tax-amount").textContent = taxAmount.toLocaleString() + "원";
    document.getElementById("total-with-tax").textContent = totalWithTax.toLocaleString() + "원";
    
    // 점검 내역서 표시
    if (hasItems) {
        document.getElementById("report-result").style.display = "block";
    } else {
        alert("적어도 하나의 항목을 선택해주세요.");
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
    
    // 함수: 카테고리 항목 추가
    function addCategoryToReport(category, price, details, tbody) {
        const tr = document.createElement("tr");
        
        // 카테고리 셀
        const tdCategory = document.createElement("td");
        tdCategory.textContent = category;
        tdCategory.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdCategory);
        
        // 세부 내용 셀
        const tdDesc = document.createElement("td");
        if (details && details.length > 0) {
            tdDesc.innerHTML = details.map(detail => 
                `<span class="detail-item">- ${detail}</span>`
            ).join('');
        } else {
            tdDesc.textContent = "전체 점검";
        }
        tdDesc.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdDesc);
        
        // 금액 셀
        const tdAmount = document.createElement("td");
        tdAmount.textContent = price.toLocaleString() + "원";
        tdAmount.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdAmount);
        
        tbody.appendChild(tr);
    }
    
    // 함수: 일반 항목 추가 (출장비용)
    function addItemToReport(category, description, price, tbody) {
        const tr = document.createElement("tr");
        
        // 카테고리 셀
        const tdCategory = document.createElement("td");
        tdCategory.textContent = category;
        tdCategory.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdCategory);
        
        // 세부 내용 셀
        const tdDesc = document.createElement("td");
        tdDesc.textContent = description;
        tdDesc.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdDesc);
        
        // 금액 셀
        const tdAmount = document.createElement("td");
        tdAmount.textContent = price.toLocaleString() + "원";
        tdAmount.style.verticalAlign = "middle"; // 수직 가운데 정렬 추가
        tr.appendChild(tdAmount);
        
        tbody.appendChild(tr);
    }
}

// 빈 공간 조정 함수
function adjustEmptySpace(itemCount) {
    const emptySpace = document.getElementById('empty-space');
    
    // 항목 수에 따라 빈 공간 높이 조정
    if (itemCount <= 1) {
        emptySpace.style.minHeight = '180px';
    } else if (itemCount <= 2) {
        emptySpace.style.minHeight = '150px';
    } else if (itemCount <= 3) {
        emptySpace.style.minHeight = '120px';
    } else if (itemCount <= 4) {
        emptySpace.style.minHeight = '90px';
    } else if (itemCount <= 5) {
        emptySpace.style.minHeight = '60px';
    } else {
        emptySpace.style.minHeight = '30px';
    }
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
                                  
