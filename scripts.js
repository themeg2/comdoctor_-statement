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
    // 내역서 요소 가져오기
    const reportContainer = document.querySelector('.report-container');
    
    if (!reportContainer) {
        alert('내역서를 찾을 수 없습니다.');
        return;
    }
    
    // 불필요한 버튼 숨기기
    const buttons = reportContainer.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.display = 'none';
    });
    
    // 인쇄 다이얼로그 실행 전에 레이아웃 최적화
    optimizePrintLayout();
    
    // 인쇄 다이얼로그 실행
    setTimeout(() => {
        window.print();
        
        // 인쇄 후 버튼 다시 표시
        setTimeout(() => {
            buttons.forEach(button => {
                button.style.display = 'block';
            });
        }, 1000);
    }, 300);
}

// 인쇄 레이아웃 최적화 함수
function optimizePrintLayout() {
    // 추가 스타일을 적용할 스타일 요소 생성
    let printStyle = document.getElementById('print-style');
    
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-style';
        document.head.appendChild(printStyle);
    }
    
    // 인쇄 시 URL, 날짜, 페이지 번호 등 숨기기 위한 스타일 추가
    printStyle.textContent = `
        @page {
            size: A4 portrait;
            margin: 0mm !important;
            marks: none;
        }
        
        @page :first {
            margin-top: 0mm !important;
            margin-bottom: 0mm !important;
        }
        
        @page :left {
            margin-left: 0mm !important;
        }
        
        @page :right {
            margin-right: 0mm !important;
        }
        
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }
            
            .container, button {
                display: none !important;
            }
            
            .report-container {
                display: block !important;
                margin: 0 auto !important;
                padding: 10mm !important;
                width: 190mm !important;
                height: 277mm !important;
                box-shadow: none !important;
                overflow: hidden !important;
            }
            
            .report-content {
                transform: scale(0.95) !important;
                transform-origin: top center !important;
            }
            
            /* 텍스트 선명도 향상 */
            * {
                text-rendering: optimizeLegibility !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }
        }
    `;
}