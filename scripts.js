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

// scripts.js 파일에 추가 또는 수정할 코드
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
    
    // 인쇄 전에 최적화
    optimizeForA4Print();
    
    // 인쇄 다이얼로그 실행
    setTimeout(() => {
        window.print();
        
        // 인쇄 후 버튼 다시 표시
        setTimeout(() => {
            buttons.forEach(button => {
                button.style.display = 'block';
            });
            
            // 인쇄 후 원래 상태로 복원
            restoreAfterPrinting();
        }, 1000);
    }, 300);
}

// A4 인쇄 최적화
function optimizeForA4Print() {
    // 추가 스타일을 적용할 스타일 요소 생성
    let printStyle = document.getElementById('print-style');
    
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-style';
        document.head.appendChild(printStyle);
    }
    
    // A4 페이지에 맞는 여유 있는 스타일 추가
    printStyle.textContent = `
        @page {
            size: A4 portrait;
            margin: 15mm !important; /* 여백 추가 */
            marks: none;
        }
        
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                background-color: #fff;
            }
            
            .container, button, .modal-close {
                display: none !important;
            }
            
            .modal-overlay {
                position: absolute !important;
                background-color: white !important;
                overflow: visible !important;
                height: auto !important;
                display: block !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
            }
            
            .modal-container {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                height: auto !important;
            }
            
            .modal-body {
                max-height: none !important;
                overflow: visible !important;
                height: auto !important;
                padding: 0 !important;
            }
            
            .report-container {
                display: block !important;
                margin: 0 auto !important;
                padding: 0 !important;
                width: 180mm !important;  /* A4 폭에서 여백 고려 */
                height: auto !important;
                box-shadow: none !important;
                overflow: visible !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            
            .report-content {
                transform: scale(0.9) !important; /* 약간 더 여유롭게 크기 조정 */
                transform-origin: top center !important;
                height: auto !important;
                overflow: visible !important;
                margin: 0 auto !important;
            }
            
            /* 섹션 간 여백 추가 */
            .business-table-container {
                margin-bottom: 10px !important;
            }
            
            .service-description {
                margin: 10px 0 !important;
            }
            
            /* 테이블 간격 조정 */
            .report-items td, .report-items th {
                padding: 3px 5px !important;
            }
            
            /* 빈 공간 제거 */
            .empty-space {
                display: none !important;
                height: 0 !important;
            }
            
            /* 하단 여백 추가 */
            .footer-info {
                margin-top: 10px !important;
                margin-bottom: 15px !important;
            }
            
            /* 청구금액 강조 */
            .total-amount {
                font-weight: bold !important;
                color: #e74c3c !important;
            }
        }
    `;
    
    // 원래 상태 저장 및 최적화 설정
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (reportContainer && reportContent) {
        // 원래 상태 저장
        reportContainer.dataset.originalStyle = reportContainer.getAttribute('style');
        reportContent.dataset.originalStyle = reportContent.getAttribute('style');
        
        // 높이와 오버플로우 설정
        reportContainer.style.height = 'auto';
        reportContent.style.height = 'auto';
        reportContainer.style.overflow = 'visible';
        reportContent.style.overflow = 'visible';
        reportContent.style.transform = 'scale(0.9)';
        reportContent.style.transformOrigin = 'top center';
        
        // 빈 공간 제거
        const emptySpace = reportContainer.querySelector('.empty-space');
        if (emptySpace) {
            emptySpace.dataset.originalStyle = emptySpace.getAttribute('style');
            emptySpace.style.display = 'none';
            emptySpace.style.height = '0';
            emptySpace.style.minHeight = '0';
        }
        
        // 섹션 간 여백 조정
        const sections = reportContainer.querySelectorAll('.business-table-container, .service-description, .table-container');
        sections.forEach(section => {
            section.dataset.originalMargin = section.style.marginBottom;
            section.style.marginBottom = '10px';
        });
    }
}

// 인쇄 후 원래 상태로 복원
function restoreAfterPrinting() {
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (reportContainer && reportContent) {
        // 원래 스타일 복원
        if (reportContainer.dataset.originalStyle) {
            reportContainer.setAttribute('style', reportContainer.dataset.originalStyle || '');
        }
        
        if (reportContent.dataset.originalStyle) {
            reportContent.setAttribute('style', reportContent.dataset.originalStyle || '');
        }
        
        // 빈 공간 복원
        const emptySpace = document.querySelector('.empty-space');
        if (emptySpace && emptySpace.dataset.originalStyle) {
            emptySpace.setAttribute('style', emptySpace.dataset.originalStyle || '');
        }
        
        // 섹션 여백 복원
        const sections = document.querySelectorAll('.business-table-container, .service-description, .table-container');
        sections.forEach(section => {
            if (section.dataset.originalMargin) {
                section.style.marginBottom = section.dataset.originalMargin;
            }
        });
    }
}

// 내역서 생성 후 A4에 맞추는 함수 수정
function adjustReportToFitA4() {
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (!reportContainer || !reportContent) return;
    
    // 빈 공간 제거
    const emptySpace = reportContainer.querySelector('.empty-space');
    if (emptySpace) {
        emptySpace.style.display = 'none';
        emptySpace.style.height = '0';
    }
    
    // 여유 있는 레이아웃을 위해 스케일 조정
    reportContent.style.transform = 'scale(0.9)';
    reportContent.style.transformOrigin = 'top center';
    reportContent.style.margin = '0 auto';
    
    // 모든 내용이 보이도록 설정
    reportContainer.style.height = 'auto';
    reportContent.style.height = 'auto';
    reportContainer.style.overflow = 'visible';
    reportContent.style.overflow = 'visible';
    
    // 섹션 간 여백 조정
    const sections = reportContainer.querySelectorAll('.business-table-container, .service-description, .table-container');
    sections.forEach(section => {
        section.style.marginBottom = '10px';
    });
}