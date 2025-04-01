// html2canvas 라이브러리 로드
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (window.html2canvas) {
            resolve(window.html2canvas);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => reject(new Error('html2canvas 로드 실패'));
        document.head.appendChild(script);
    });
}

// axios 라이브러리 로드
function loadAxios() {
    return new Promise((resolve, reject) => {
        if (window.axios) {
            resolve(window.axios);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
        script.onload = () => resolve(window.axios);
        script.onerror = () => reject(new Error('axios 로드 실패'));
        document.head.appendChild(script);
    });
}

// 텔레그램 전송 버튼 추가
function addTelegramButton(reportContainer) {
    // 저장 버튼 가져오기
    const saveButton = reportContainer.querySelector('.save-button');
    
    // 텔레그램 전송 버튼 추가
    const telegramButton = document.createElement('button');
    telegramButton.className = 'save-button';
    telegramButton.style.backgroundColor = '#0088cc'; // 텔레그램 색상
    telegramButton.style.marginTop = '10px';
    telegramButton.innerHTML = '<span style="display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 5px;" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg> 텔레그램 전송</span>';
    telegramButton.onclick = sendReportToTelegram;
    
    // 버튼 추가
    if (saveButton) {
        saveButton.insertAdjacentElement('afterend', telegramButton);
    } else {
        reportContainer.appendChild(telegramButton);
    }
}

// 내역서를 이미지로 변환하여 텔레그램으로 전송 (텍스트 또렷하게 개선)
async function sendReportToTelegram() {
    const statusMsg = document.createElement('div');
    try {
        // 상태 메시지 스타일 설정
        Object.assign(statusMsg.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '15px 25px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '5px',
            zIndex: '10000',
            fontSize: '16px'
        });
        statusMsg.textContent = '이미지 변환 중...';
        document.body.appendChild(statusMsg);

        // 필요한 라이브러리 로드
        const [html2canvas, axios] = await Promise.all([
            loadHtml2Canvas(),
            loadAxios()
        ]);

        // 고객 정보 추출
        const titleElement = document.querySelector('.report-title');
        const titleText = titleElement ? titleElement.textContent : '';
        
        // 제목에서 고객 이름 추출
        const titleParts = titleText.split('님 점검내역서');
        const customerInfo = titleParts[0] || '';
        const customerName = customerInfo.split(' ').pop() || '고객';
        const currentDate = customerInfo.replace(customerName, '').trim() || new Date().toLocaleDateString();

        // 보고서 컨테이너 준비
        const reportContainer = document.querySelector('.report-container');
        if (!reportContainer) throw new Error('내역서를 찾을 수 없습니다.');

        // 텍스트 선명도 향상을 위한 폰트 최적화
        optimizeTextRendering(reportContainer);

        // 보고서 레이아웃 최적화
        optimizeReportLayout(reportContainer);

        // 캡처 컨테이너 설정 (가운데 정렬)
        const captureContainer = document.createElement('div');
        Object.assign(captureContainer.style, {
            width: '210mm',
            height: '297mm', // A4 고정 높이
            margin: '0 auto', // 가운데 정렬을 위한 마진 설정
            padding: '0',
            background: '#FFFFFF',
            position: 'absolute',
            left: '-9999px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
        });

        // 콘텐츠 복제 및 스타일 최적화
        const clonedContent = reportContainer.cloneNode(true);
        Object.assign(clonedContent.style, {
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            margin: '0 auto', // 가운데 정렬 추가
            padding: '10mm',
            boxSizing: 'border-box',
            transformOrigin: 'center top',
            transform: 'scale(0.95)', // 약간 축소 (너무 작으면 텍스트가 흐려짐)
            overflow: 'visible'
        });
        
        // 불필요한 버튼 제거
        const buttons = clonedContent.querySelectorAll('button');
        buttons.forEach(button => button.remove());

        // 감사 인사 메시지가 확실히 보이도록 마진 조정
        const thankYouMsg = clonedContent.querySelector('.thanks-message');
        if (thankYouMsg) {
            thankYouMsg.style.margin = '15px 0 10px 0';
            thankYouMsg.style.fontSize = '14px';
            thankYouMsg.style.color = '#333';
            thankYouMsg.style.fontWeight = 'bold';
            thankYouMsg.style.textShadow = '0 0 0 #000'; // 텍스트 선명도 향상
        }

        document.body.appendChild(captureContainer);
        captureContainer.appendChild(clonedContent);

        // 캡처 설정 - 선명도 향상을 위해 스케일 증가
        const canvas = await html2canvas(captureContainer, {
            scale: 3, // 해상도 증가 (2에서 3으로 변경)
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#FFFFFF',
            windowWidth: captureContainer.offsetWidth,
            windowHeight: captureContainer.offsetHeight,
            x: 0,
            y: 0,
            width: captureContainer.offsetWidth,
            height: captureContainer.offsetHeight,
            imageTimeout: 30000, // 타임아웃 증가
            letterRendering: true, // 글자 렌더링 품질 향상
            onclone: function(clonedDoc) {
                // 클론된 문서에 추가 스타일 적용
                const clonedContainer = clonedDoc.querySelector('.report-container');
                if (clonedContainer) {
                    clonedContainer.style.display = 'block';
                    clonedContainer.style.margin = '0 auto'; // 가운데 정렬 강제
                    clonedContainer.style.boxShadow = 'none';
                    
                    // 내용물 가운데 정렬 강화
                    const reportContent = clonedContainer.querySelector('.report-content');
                    if (reportContent) {
                        reportContent.style.margin = '0 auto';
                        reportContent.style.transformOrigin = 'center top';
                    }
                    
                    // 텍스트 선명도 향상을 위한 스타일 적용
                    enhanceTextClarity(clonedDoc);
                }
            }
        });

        // 텔레그램 이미지 최적화
        const telegramMaxWidth = 1280;
        const telegramMaxHeight = 1600; // 텔레그램은 세로로 긴 이미지도 잘 지원
        
        let finalCanvas = canvas;
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        
        // 텔레그램 이미지 최적화 - 선명도 유지를 위해 크기 조정 방식 변경
        if (originalWidth > telegramMaxWidth || originalHeight > telegramMaxHeight) {
            const widthRatio = telegramMaxWidth / originalWidth;
            const heightRatio = telegramMaxHeight / originalHeight;
            const ratio = Math.min(widthRatio, heightRatio);
            
            const newWidth = Math.floor(originalWidth * ratio);
            const newHeight = Math.floor(originalHeight * ratio);
            
            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = newWidth;
            resizedCanvas.height = newHeight;
            
            const ctx = resizedCanvas.getContext('2d');
            // 이미지 렌더링 품질 최대화
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, newWidth, newHeight); // 흰색 배경 추가
            // 안티앨리어싱 적용하여 이미지 그리기
            ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
            
            finalCanvas = resizedCanvas;
        }

        // 이미지 데이터 생성 - 품질 최대화
        const imageData = finalCanvas.toDataURL('image/jpeg', 0.98); // 품질 최대화
        const blob = await (await fetch(imageData)).blob();

        // 텔레그램 전송 준비
        statusMsg.textContent = '텔레그램으로 전송 중...';
        const formData = new FormData();
        formData.append('chat_id', '5934421096');
        formData.append('caption', `[${currentDate}] ${customerName}님의 컴퓨터 점검 내역서`);
        formData.append('photo', blob, 'report.jpg');

        // 텔레그램 전송
        const response = await axios({
            method: 'post',
            url: 'https://api.telegram.org/bot7274631975:AAEsb1gtaMhMpUEHYaYi7wwdidLyVGJ0cUY/sendPhoto',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 결과 처리
        if (response.data?.ok) {
            statusMsg.textContent = '전송 완료!';
            statusMsg.style.background = 'rgba(46, 204, 113, 0.8)';
            setTimeout(() => statusMsg.remove(), 2000);
        } else {
            throw new Error('텔레그램 API 응답 오류: ' + JSON.stringify(response.data));
        }

    } catch (error) {
        console.error('텔레그램 전송 오류:', error);
        statusMsg.textContent = '전송 실패: ' + (error.message || '알 수 없는 오류');
        statusMsg.style.background = 'rgba(231, 76, 60, 0.8)';
        setTimeout(() => statusMsg.remove(), 3000);
    } finally {
        // 임시 요소 정리
        const captureContainer = document.querySelector('[style*="-9999px"]');
        if (captureContainer) captureContainer.remove();
    }
}

// 텍스트 렌더링 최적화 함수
function optimizeTextRendering(container) {
    if (!container) return;
    
    // 모든 텍스트 요소에 최적화 적용
    const textElements = container.querySelectorAll('*');
    textElements.forEach(el => {
        // 텍스트 선명도 향상
        el.style.textRendering = 'optimizeLegibility';
        el.style.webkitFontSmoothing = 'antialiased';
        el.style.mozOsxFontSmoothing = 'grayscale';
        
        // 폰트 두께 약간 증가하여 선명도 향상
        if (window.getComputedStyle(el).fontWeight === 'normal' || 
            window.getComputedStyle(el).fontWeight === '400') {
            el.style.fontWeight = '500';
        }
        
        // 중요 요소 강조
        if (el.tagName === 'TH' || el.tagName === 'TD') {
            el.style.textShadow = '0 0 0 #000'; // 글자 선명도 향상
        }
    });
    
    // 테이블 셀 내용 강조
    const tableCells = container.querySelectorAll('.report-items td, .report-items th');
    tableCells.forEach(cell => {
        cell.style.fontWeight = parseInt(window.getComputedStyle(cell).fontWeight) + 100;
    });
    
    // 제목 강조
    const reportTitle = container.querySelector('.report-title');
    if (reportTitle) {
        reportTitle.style.textShadow = '0 0 0 #000';
        reportTitle.style.fontWeight = '700';
        reportTitle.style.letterSpacing = '1px';
    }
}

// 클론된 문서에 텍스트 선명도 향상 스타일 적용
function enhanceTextClarity(clonedDoc) {
    // 글꼴 선명도 향상을 위한 스타일 추가
    const styleElement = clonedDoc.createElement('style');
    styleElement.textContent = `
        * {
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
        
        td, th, p, div, span {
            text-shadow: 0 0 0 #000;
        }
        
        .report-title {
            font-weight: 700 !important;
            letter-spacing: 1px !important;
            text-shadow: 0 0 0 #000 !important;
        }
        
        .report-items td, .report-items th {
            font-weight: 500 !important;
        }
        
        .thanks-message {
            font-weight: 700 !important;
            font-size: 16px !important;
            text-shadow: 0 0 0 #000 !important;
        }
    `;
    clonedDoc.head.appendChild(styleElement);
    
    // 특정 요소에 추가 강조
    const reportItems = clonedDoc.querySelectorAll('.report-items td, .report-items th');
    reportItems.forEach(item => {
        item.style.fontWeight = '500';
    });
    
    // 금액 강조
    const amounts = clonedDoc.querySelectorAll('.amount, .total-amount');
    amounts.forEach(amount => {
        amount.style.fontWeight = '600';
    });
}

// 보고서 레이아웃 최적화 함수
function optimizeReportLayout(reportContainer) {
    if (!reportContainer) return;

    // 빈 공간 최소화
    const emptySpace = reportContainer.querySelector('.empty-space');
    if (emptySpace) {
        emptySpace.style.minHeight = '0';
        emptySpace.style.maxHeight = '0'; // 완전히 제거
        emptySpace.style.margin = '0';
    }

    // 세부 항목 간격 최소화
    const servicePoints = reportContainer.querySelectorAll('.service-point');
    servicePoints.forEach(point => {
        point.style.marginBottom = '2px';
        point.style.padding = '2px 5px';
    });

    // 테이블 셀 패딩 최소화
    const tableCells = reportContainer.querySelectorAll('.report-items td, .report-items th');
    tableCells.forEach(cell => {
        cell.style.padding = '2px';
    });

    // 세금 정보 테이블 최적화
    const taxTable = reportContainer.querySelector('.tax-table');
    if (taxTable) {
        taxTable.style.marginBottom = '5px';
        
        const taxCells = taxTable.querySelectorAll('td, th');
        taxCells.forEach(cell => {
            cell.style.padding = '2px 5px';
        });
    }

    // 서비스 설명 최적화
    const serviceDescription = reportContainer.querySelector('.service-description');
    if (serviceDescription) {
        serviceDescription.style.margin = '3px 0';
        serviceDescription.style.padding = '5px';
    }

    // 서비스 결론 최적화
    const serviceConclusion = reportContainer.querySelector('.service-conclusion');
    if (serviceConclusion) {
        serviceConclusion.style.padding = '5px';
    }

    // 감사 인사 부분 강조
    const stamp = reportContainer.querySelector('.stamp');
    if (stamp) {
        stamp.style.marginTop = '10px';
        stamp.style.paddingTop = '5px';
        stamp.style.textAlign = 'center';
        stamp.style.borderTop = '1px dashed #ddd';
    }

    // 보고서 컨텐츠 가운데 정렬
    const reportContent = reportContainer.querySelector('.report-content');
    if (reportContent) {
        // 전체 내용 중앙 정렬
        reportContent.style.margin = '0 auto';
        reportContent.style.transformOrigin = 'center top';
    }
}
/// 점검 내역서 생성 함수
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
    
    // 제목 (점검일과 고객명 포함)
    const reportTitle = document.createElement('div');
    reportTitle.className = 'report-title';
    
    // 타이틀을 위아래 줄로 나누어 표시
    const titleDate = dateInput ? formatDate(dateInput) : formatDate(new Date().toISOString().slice(0, 10));
    reportTitle.innerHTML = `${titleDate}<br>${customerName}님 점검내역서`;
    
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

    // 빈 공간 추가 - 최소화
    const emptySpace = document.createElement('div');
    emptySpace.className = 'empty-space';
    emptySpace.style.minHeight = '0';
    emptySpace.style.maxHeight = '5px';
    tableContainer.appendChild(emptySpace);
    
    // 세금 정보 추가
    const supplyAmount = totalAmount;
    const taxAmount = Math.round(totalAmount * 0.1);
    const totalWithTax = supplyAmount + taxAmount;
    
    // 세금 정보 및 감사인사 부분 업데이트 - 더 컴팩트하게
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
                    <p>※ 부가가치세는 부가가치세법에 따라 재화 및 용역의 공급에 부과되는 세금으로, 최종 소비자가 부담하는 간접세입니다. ※ 사업자는 이를 대신 수납하여 국가에 납부합니다.</p>
                </div>
            </div>
            
            <div class="payment-info">
                <div class="account-info">
                    <p class="info-title">입금 계좌 정보</p>
                    <p class="account-number">기업은행 093-149055-04-014 (최성현)</p>
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
    
    // 텔레그램 전송 버튼 추가
    addTelegramButton(reportContainer);
    
    // 모달에 추가
    modalBody.appendChild(reportContainer);
    
    // 모달 표시
    document.getElementById('report-modal').style.display = 'block';
    
    // A4 페이지에 맞게 자동 조정
    setTimeout(adjustReportToFitA4, 100);
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
        // 크기 조정 비율 계산 - 더 작게 만들어 여유 있게
        const scale = (A4_HEIGHT_PX / contentHeight) * 0.92; // 스케일 더 작게 조정
        
        // CSS transform을 사용하여 크기 조정
        reportContent.style.transform = `scale(${scale})`;
        reportContent.style.transformOrigin = 'top center'; // 중앙 정렬
        
        // 변환 후 높이가 100%가 되도록 컨테이너 높이 조정
        reportContainer.style.height = `${A4_HEIGHT_PX}px`;
        
        // 원래 내용물의 높이를 유지하면서 변환
        reportContent.style.height = `${contentHeight}px`;
        
        console.log(`내용이 A4 용지보다 ${Math.round((1-scale)*100)}% 더 커서 ${scale.toFixed(2)}배로 축소합니다.`);
    }
}