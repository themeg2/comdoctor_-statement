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

// scripts.js 파일에 추가할 코드
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
    compressReportForPrinting();
    
    // 인쇄 다이얼로그 실행
    setTimeout(() => {
        window.print();
        
        // 인쇄 후 버튼 다시 표시
        setTimeout(() => {
            buttons.forEach(button => {
                button.style.display = 'block';
            });
            
            // 인쇄 후 원래 상태로 복원
            restoreReportAfterPrinting();
        }, 1000);
    }, 300);
}

// 인쇄를 위해 내역서 압축
function compressReportForPrinting() {
    // 추가 스타일을 적용할 스타일 요소 생성
    let printStyle = document.getElementById('print-style');
    
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-style';
        document.head.appendChild(printStyle);
    }
    
    // 인쇄 스타일 추가
    printStyle.textContent = `
        @page {
            size: A4 portrait;
            margin: 0;
            marks: none;
        }
        
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
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
                padding: 5mm !important;
                width: 200mm !important;
                height: auto !important;
                box-shadow: none !important;
                overflow: visible !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            
            .report-content {
                transform: scale(0.85) !important;
                transform-origin: top center !important;
                height: auto !important;
                overflow: visible !important;
                padding: 0 !important;
                margin: 0 auto !important;
            }
            
            /* 빈 공간 제거 */
            .empty-space {
                display: none !important;
                height: 0 !important;
                min-height: 0 !important;
                max-height: 0 !important;
            }
            
            /* 폰트 크기 최적화 */
            .report-title {
                font-size: 16px !important;
                margin-bottom: 5px !important;
                letter-spacing: 0 !important;
            }
            
            .business-header {
                padding: 8px !important;
            }
            
            .business-name {
                font-size: 15px !important;
            }
            
            .representative {
                font-size: 10px !important;
                margin-right: 30px !important;
            }
            
            .official-seal {
                width: 35px !important;
                height: 35px !important;
            }
            
            .logo-placeholder {
                width: 30px !important;
                height: 30px !important;
                font-size: 18px !important;
                margin-right: 8px !important;
            }
            
            .service-title {
                font-size: 13px !important;
                margin-bottom: 4px !important;
            }
            
            .service-intro, .conclusion-content {
                font-size: 10px !important;
                line-height: 1.2 !important;
            }
            
            .service-point {
                margin-bottom: 2px !important;
                padding: 2px 4px !important;
            }
            
            .point-title, .point-description {
                font-size: 10px !important;
                line-height: 1.2 !important;
            }
            
            .business-info-item {
                padding: 5px !important;
            }
            
            .info-label, .info-value {
                font-size: 10px !important;
            }
            
            /* 테이블 셀 패딩 최소화 */
            .report-items th, .report-items td {
                padding: 2px !important;
                font-size: 10px !important;
            }
            
            .detail-item {
                font-size: 9px !important;
                line-height: 1.1 !important;
                margin-bottom: 1px !important;
            }
            
            /* 세금 정보 테이블 컴팩트하게 */
            .tax-table td, .tax-table th {
                padding: 2px !important;
                font-size: 10px !important;
            }
            
            .tax-note {
                font-size: 8px !important;
                padding: 3px !important;
                margin-top: 2px !important;
            }
            
            .account-info, .receipt-info {
                padding: 5px !important;
            }
            
            .info-title {
                font-size: 10px !important;
                margin: 0 0 4px 0 !important;
                padding-bottom: 2px !important;
            }
            
            .account-number {
                font-size: 10px !important;
                margin: 2px 0 !important;
            }
            
            .thanks-message {
                font-size: 12px !important;
                margin: 8px 0 5px 0 !important;
            }
            
            /* 각 섹션이 분리되지 않도록 설정 */
            .service-description, .report-items, .tax-info, .payment-info, .business-table-container {
                page-break-inside: avoid !important;
            }
        }
    `;
    
    // 내역서 요소 최적화
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    const emptySpace = document.querySelector('.empty-space');
    
    if (emptySpace) {
        // 원래 상태를 저장
        emptySpace.dataset.originalDisplay = emptySpace.style.display;
        emptySpace.dataset.originalHeight = emptySpace.style.minHeight;
        
        // 빈 공간 제거
        emptySpace.style.display = 'none';
        emptySpace.style.minHeight = '0';
        emptySpace.style.height = '0';
    }
    
    if (reportContainer && reportContent) {
        // 원래 상태 저장
        reportContainer.dataset.originalHeight = reportContainer.style.height;
        reportContent.dataset.originalHeight = reportContent.style.height;
        reportContent.dataset.originalTransform = reportContent.style.transform;
        reportContent.dataset.originalOrigin = reportContent.style.transformOrigin;
        
        // 인쇄 최적화 설정
        reportContainer.style.height = 'auto';
        reportContent.style.height = 'auto';
        reportContainer.style.overflow = 'visible';
        reportContent.style.overflow = 'visible';
        reportContent.style.transform = 'scale(0.85)';
        reportContent.style.transformOrigin = 'top center';
    }
    
    // 각 섹션의 여백 줄이기
    const sections = document.querySelectorAll('.business-table-container, .service-description, .table-container, .footer-info');
    sections.forEach(section => {
        section.dataset.originalMargin = section.style.marginBottom;
        section.style.marginBottom = '5px';
    });
}

// 인쇄 후 원래 상태로 복원
function restoreReportAfterPrinting() {
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    const emptySpace = document.querySelector('.empty-space');
    
    if (emptySpace && emptySpace.dataset.originalDisplay) {
        emptySpace.style.display = emptySpace.dataset.originalDisplay;
        emptySpace.style.minHeight = emptySpace.dataset.originalHeight;
    }
    
    if (reportContainer && reportContent) {
        if (reportContainer.dataset.originalHeight) {
            reportContainer.style.height = reportContainer.dataset.originalHeight;
        }
        
        if (reportContent.dataset.originalHeight) {
            reportContent.style.height = reportContent.dataset.originalHeight;
        }
        
        if (reportContent.dataset.originalTransform) {
            reportContent.style.transform = reportContent.dataset.originalTransform;
        }
        
        if (reportContent.dataset.originalOrigin) {
            reportContent.style.transformOrigin = reportContent.dataset.originalOrigin;
        }
    }
    
    // 섹션 여백 복원
    const sections = document.querySelectorAll('.business-table-container, .service-description, .table-container, .footer-info');
    sections.forEach(section => {
        if (section.dataset.originalMargin) {
            section.style.marginBottom = section.dataset.originalMargin;
        }
    });
}

// 기존 함수 대체
function adjustReportToFitA4() {
    const reportContainer = document.querySelector('.report-container');
    const reportContent = document.querySelector('.report-content');
    
    if (!reportContainer || !reportContent) return;
    
    // 빈 공간 제거
    const emptySpace = reportContainer.querySelector('.empty-space');
    if (emptySpace) {
        emptySpace.style.display = 'none';
        emptySpace.style.minHeight = '0';
        emptySpace.style.height = '0';
    }
    
    // 컨텐츠 변환
    reportContent.style.transform = 'scale(0.85)';
    reportContent.style.transformOrigin = 'top center';
    
    // 모든 내용이 보이도록 함
    reportContainer.style.height = 'auto';
    reportContent.style.height = 'auto';
    reportContainer.style.overflow = 'visible';
    reportContent.style.overflow = 'visible';
    
    // 각 섹션 사이 여백 줄이기
    const sections = reportContainer.querySelectorAll('.business-table-container, .service-description, .table-container');
    sections.forEach(section => {
        section.style.marginBottom = '5px';
    });
}