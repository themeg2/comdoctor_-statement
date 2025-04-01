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

// 내역서 내용을 A4 용지 한 장에 맞추기 위한 자동 크기 조정 함수
function adjustReportToFitA4() {
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (!reportContainer || !reportContent) return;
    
    // A4 용지의 실제 크기 (mm 단위를 픽셀로 대략 변환)
    const A4_HEIGHT_PX = 1123; // 297mm * 3.78 pixels/mm (대략적인 변환)
    
    // 컨테이너에 auto-fit-text 클래스 추가
    reportContent.classList.add('auto-fit-text');
    
    // 문서의 실제 높이 구하기
    const contentHeight = reportContent.scrollHeight;
    
    // 문서가 A4 용지보다 크면 비율 조정
    if (contentHeight > A4_HEIGHT_PX) {
        // 크기 조정 비율 계산 - 약간 더 작게 만들어 여유 있게
        const scale = (A4_HEIGHT_PX / contentHeight) * 0.98;
        
        // CSS transform을 사용하여 크기 조정
        reportContent.style.transform = `scale(${scale})`;
        
        // 변환 후 높이가 100%가 되도록 컨테이너 높이 조정
        reportContainer.style.height = `${A4_HEIGHT_PX}px`;
        
        // 원래 내용물의 높이를 유지하면서 변환
        reportContent.style.height = `${contentHeight}px`;
        reportContent.style.transformOrigin = 'top left';
        
        console.log(`내용이 A4 용지보다 ${Math.round((1-scale)*100)}% 더 커서 ${scale.toFixed(2)}배로 축소합니다.`);
    }
}

function adjustEmptySpace(itemCount) {
    // 항목 수에 따라 빈 공간을 더 작게 조정
    const tableContainer = document.querySelector('.table-container');
    const emptySpace = document.querySelector('.empty-space');
    
    if (!tableContainer || !emptySpace) return;
    
    // 항목 수가 많을수록 빈 공간을 더 줄임
    const height = Math.max(10, 120 - (itemCount * 15)) + 'px';
    emptySpace.style.minHeight = height;
}

// 프린트 저장 기능 개선
function saveToPrint() {
    // 인쇄 전 모바일/데스크톱 확인 및 최적화
    const isMobile = isMobileDevice();
    
    // 내역서 요소 가져오기
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (!reportContainer || !reportContent) return;
    
    // 모바일에서는 더 작은 스케일로 조정
    if (isMobile) {
        reportContent.style.transform = 'scale(0.80)';
    } else {
        // 기존 방식으로 A4에 맞추기
        adjustReportToFitA4();
    }
    
    // 약간의 시간 간격을 두고 인쇄 다이얼로그 실행
    setTimeout(() => {
        window.print();
    }, 300);
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