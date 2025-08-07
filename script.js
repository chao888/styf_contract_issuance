// 日期粘贴处理函数
function handleDatePaste(event) {
    event.preventDefault();
    
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    
    // 支持多种日期格式
    const dateFormats = [
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,  // 2024-01-01 或 2024/01/01
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // 01/01/2024
        /(\d{4})(\d{2})(\d{2})/,                     // 20240101
        /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/         // 01-01-2024
    ];
    
    let parsedDate = null;
    
    for (let format of dateFormats) {
        const match = pastedText.match(format);
        if (match) {
            let year, month, day;
            
            if (format === dateFormats[0]) { // 2024-01-01
                year = match[1];
                month = match[2].padStart(2, '0');
                day = match[3].padStart(2, '0');
            } else if (format === dateFormats[1]) { // 01/01/2024
                year = match[3];
                month = match[1].padStart(2, '0');
                day = match[2].padStart(2, '0');
            } else if (format === dateFormats[2]) { // 20240101
                year = match[1];
                month = match[2];
                day = match[3];
            } else { // 01-01-2024
                year = match[3];
                month = match[1].padStart(2, '0');
                day = match[2].padStart(2, '0');
            }
            
            parsedDate = `${year}-${month}-${day}`;
            break;
        }
    }
    
    if (parsedDate) {
        event.target.value = parsedDate;
    } else {
        // 如果无法解析，保持原样
        event.target.value = pastedText;
    }
}

// 为所有日期输入框添加粘贴事件监听
function setupDatePasteHandlers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('paste', handleDatePaste);
    });
}

// 表单提交处理
document.getElementById('contractForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // 生成合同内容
    const contractContent = contractTemplate.generate(data);
    
    // 显示合同预览
    document.getElementById('contractPreview').innerHTML = contractContent;
    
    // 在移动设备上滚动到预览区域
    if (window.innerWidth < 768) {
        document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// 导出PDF功能的事件监听器在下方

// 导出PDF功能 - 优化格式和质量
document.getElementById('exportPDF').addEventListener('click', async function() {
    await exportToPDF();
});

// // 导出Word功能
// document.getElementById('exportWord').addEventListener('click', async function() {
//     await exportToWord();
// });

// // 导出图片功能
// document.getElementById('exportImage').addEventListener('click', async function() {
//     await exportToImage();
// });

// 导出PDF函数
async function exportToPDF() {
    const element = document.getElementById('contractPreview');
    
    if (!element || element.innerHTML.trim() === '') {
        alert('请先生成协议内容后再导出PDF');
        return;
    }
    
    try {
        // 创建完整的HTML文档结构，优化分页和边距
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>食堂有饭软件系统服务补充协议</title>
                <style>
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body {
                        font-family: '宋体', SimSun, serif;
                        font-size: 16px; /* 小四字体 */
                        line-height: 1.6;
                        margin: 0 auto; /* 居中显示 */
                        padding: 20px 0;
                        color: #000;
                        background: #fff;
                        width: 200mm;
                        box-sizing: border-box;
                        min-height: 257mm;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    h3 {
                        font-size: 28px; /* 小二字体 */
                        font-weight: bold;
                        text-align: center;
                        margin: 0 0 20px 0;
                        page-break-after: avoid;
                    }
                    p {
                        margin: 0 0 20px 0;
                        text-indent: 2em;
                        font-size: 18px; /* 小四字体 */
                        line-height: 1.8;
                        color: #000;
                        orphans: 2;
                        widows: 2;
                        page-break-inside: avoid;
                    }
                    .no-indent {
                        text-indent: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 12px 0;
                        font-size: 16px; /* 小四字体 */
                        border: 1px solid #000;
                        page-break-inside: avoid;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                        font-size: 14px; /* 小四字体 */
                        line-height: 1.4;
                    }
                    th {
                        font-weight: bold;
                        background-color: #f5f5f5;
                    }
                    .signature {
                        margin-top: 40px;
                        width: 100%;
                        text-align: right;
                        page-break-inside: avoid;
                    }
                    .signature > div {
                        display: inline-block;
                        text-align: left;
                        margin-bottom: 30px;
                    }
                    .signature p {
                        margin-bottom: 8px;
                        word-wrap: break-word;
                        line-height: 1.5;
                        text-indent: 0;
                        font-size: 14px; /* 小四字体 */
                    }
                    /* 避免在段落中间分页 */
                    p, table, .signature {
                        break-inside: avoid;
                    }
                    h3, p {
                        break-after: avoid;
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `;
        
        // 创建临时iframe进行精确渲染
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '794px';
        iframe.style.height = 'auto';
        iframe.style.border = 'none';
        
        document.body.appendChild(iframe);
        
        // 写入HTML内容
        iframe.contentDocument.open();
        iframe.contentDocument.write(fullHtml);
        iframe.contentDocument.close();
        
        // 等待iframe完全加载
        await new Promise(resolve => {
            if (iframe.contentDocument.readyState === 'complete') {
                resolve();
            } else {
                iframe.onload = resolve;
            }
        });
        
        // 计算A4页面尺寸（毫米）
        const A4_WIDTH = 210;
        const A4_HEIGHT = 297;
        const MARGIN = 20; // 页边距
        const CONTENT_WIDTH = A4_WIDTH - (MARGIN * 2);
        const CONTENT_HEIGHT = A4_HEIGHT - (MARGIN * 2);
        
        // 获取iframe中的内容元素
        const contentElement = iframe.contentDocument.body;
        const totalHeight = contentElement.scrollHeight;
        
        // 计算需要多少页
        const scale = CONTENT_WIDTH / 794;
        const scaledTotalHeight = totalHeight * scale;
        const totalPages = Math.ceil(scaledTotalHeight / CONTENT_HEIGHT);
        
        // 获取表单数据以生成文件名
        const form = document.getElementById('contractForm');
        const formData = new FormData(form);
        const canteenId = formData.get('canteenId') || '';
        const partyA = formData.get('partyA') || '';
        
        // 生成文件名：canteenId+partyA+服务协议
        const filename = `${canteenId}${partyA}服务协议.pdf`;
        
        // 创建PDF
        const pdf = new jspdf.jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            floatPrecision: 16,
            compress: false
        });
        
        // 逐页生成PDF
        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                pdf.addPage();
            }
            
            // 计算当前页的偏移量
            const offsetY = page * CONTENT_HEIGHT / scale;
            
            // 使用html2canvas生成当前页的内容
            const canvas = await html2canvas(contentElement, {
                scale: 2.5,
                useCORS: true,
                letterRendering: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794,
                height: Math.min(totalHeight - offsetY, CONTENT_HEIGHT / scale),
                x: 0,
                y: offsetY,
                scrollX: 0,
                scrollY: offsetY,
                windowWidth: 794,
                windowHeight: Math.min(totalHeight - offsetY, CONTENT_HEIGHT / scale),
                dpi: 300,
                imageTimeout: 30000,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = CONTENT_WIDTH;
            const imgHeight = (canvas.height * CONTENT_WIDTH) / canvas.width;
            
            // 添加图片到PDF，居中显示
            const x = MARGIN;
            const y = MARGIN;
            
            pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        }
        
        pdf.save(filename);
        
    } catch (error) {
        console.error('PDF生成失败:', error);
        alert('PDF生成失败，请重试。错误详情：' + error.message);
    } finally {
        // 清理iframe
        const iframe = document.querySelector('iframe[style*="-9999px"]');
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    }
}

// 导出Word函数
async function exportToWord() {
    try {
        const element = document.getElementById('contractPreview');
        const htmlContent = element.innerHTML;
        
        // 创建完整的HTML文档
        const fullHtml = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>食堂有饭服务协议</title>
                <style>
                    body {
                        font-family: '宋体', SimSun, serif;
                        font-size: 16px;
                        line-height: 1.8;
                        margin: 20px;
                        color: #000;
                    }
                    .contract-content {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h3 {
                        font-size: 20px;
                        font-weight: bold;
                        margin: 20px 0 15px 0;
                        text-align: center;
                    }
                    p {
                        margin: 0 0 15px 0;
                        text-align: justify;
                        text-indent: 2em;
                        word-break: break-word;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        font-weight: bold;
                        background-color: #f5f5f5;
                    }
                    .signature {
                        margin-top: 40px;
                        width: 100%;
                    }
                    .signature p {
                        margin-bottom: 10px;
                        word-break: break-word;
                        line-height: 1.6;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
        
        // 创建Blob对象
        const blob = htmlDocx.asBlob(fullHtml);
        
        // 获取表单数据以生成文件名
        const form = document.getElementById('contractForm');
        const formData = new FormData(form);
        const canteenId = formData.get('canteenId') || '';
        const partyA = formData.get('partyA') || '';
        
        // 生成文件名：canteenId+partyA+服务协议
        const filename = `${canteenId}${partyA}服务协议.docx`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        // 清理URL对象
        URL.revokeObjectURL(link.href);
        
    } catch (error) {
        console.error('导出Word失败:', error);
        alert('导出Word失败，请重试');
    }
}

// 导出图片函数
async function exportToImage() {
    try {
        const element = document.getElementById('contractPreview');
        
        // 保存原始样式
        const contractContent = document.getElementById('contractPreview');
        const originalStyles = {
            fontFamily: contractContent.style.fontFamily,
            fontSize: contractContent.style.fontSize,
            lineHeight: contractContent.style.lineHeight
        };
        
        // 应用打印样式
        contractContent.style.fontFamily = '宋体, SimSun, serif';
        contractContent.style.fontSize = '20px';
        contractContent.style.lineHeight = '2.0';
        
        // 修改所有段落和表格的字体大小
        const paragraphs = contractContent.querySelectorAll('p');
        const tables = contractContent.querySelectorAll('table');
        const headings = contractContent.querySelectorAll('h3');
        
        paragraphs.forEach(p => {
            p.style.fontSize = '18px';
            p.style.lineHeight = '1.5';
        });
        
        tables.forEach(table => {
            table.style.fontSize = '18px';
        });
        
        headings.forEach(h => {
            h.style.fontSize = '28px';
            h.style.fontWeight = 'bold';
        });
        
        // 使用html2canvas生成高质量图片
        const canvas = await html2canvas(element, {
            scale: 2,
            dpi: 144,
            letterSpacing: 0.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: element.scrollWidth,
            height: element.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });
        
        // 转换为图片并下载
        const now = new Date();
        const timestamp = now.getFullYear() + 
                        String(now.getMonth() + 1).padStart(2, '0') + 
                        String(now.getDate()).padStart(2, '0') + 
                        String(now.getHours()).padStart(2, '0') + 
                        String(now.getMinutes()).padStart(2, '0');
        
        const link = document.createElement('a');
        link.download = `食堂有饭服务协议_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        console.error('导出图片失败:', error);
        alert('导出图片失败，请重试');
    } finally {
        // 恢复原始样式
        const contractContent = document.getElementById('contractPreview');
        contractContent.style.fontFamily = '';
        contractContent.style.fontSize = '';
        contractContent.style.lineHeight = '';
        
        const paragraphs = contractContent.querySelectorAll('p');
        const tables = contractContent.querySelectorAll('table');
        const headings = contractContent.querySelectorAll('h3');
        
        paragraphs.forEach(p => {
            p.style.fontSize = '';
            p.style.lineHeight = '';
        });
        
        tables.forEach(table => {
            table.style.fontSize = '';
        });
        
        headings.forEach(h => {
            h.style.fontSize = '';
            h.style.fontWeight = '';
        });
    }
}

// 动态添加服务项目
function addServiceItem() {
    const container = document.getElementById('serviceItemsContainer');
    const items = container.querySelectorAll('.service-item');
    const newIndex = items.length;
    
    const newItem = document.createElement('div');
    newItem.className = 'service-item';
    newItem.setAttribute('data-index', newIndex);
    newItem.innerHTML = `
        <h4>服务项目 ${newIndex + 1}
            <button type="button" class="remove-service" onclick="removeServiceItem(this)">×</button>
        </h4>
        <div class="form-row">
            <div class="form-group">
                <label>订单号：</label>
                <input type="text" name="orderNumber[]" placeholder="请输入订单编号" required>
            </div>
            
            <div class="form-group">
                <label>产品/服务名称：</label>
                <select name="productName[]" required>
                    <option value="">请选择</option>
                    <option value="食堂有饭系统使用服务">"食堂有饭"系统使用服务</option>
                    <option value="青蛙PRO">青蛙PRO</option>
                    <option value="飞鹅小票机">飞鹅小票机</option>
                    <option value="飞鹅小票机接入">飞鹅小票机接入</option>
                    <option value="技术服务">技术服务</option>
                </select>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>数量/单位：</label>
                <input type="number" name="quantity[]" min="1" step="1" placeholder="请输入数量" required>
            </div>
            
            <div class="form-group">
                <label>服务开始日期：</label>
                <input type="date" name="serviceStartDate[]" placeholder="请选择开始日期" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>服务结束日期：</label>
                <input type="date" name="serviceEndDate[]" placeholder="请选择结束日期" required>
            </div>
            
            <div class="form-group">
                <label>价格（元）：</label>
                <input type="number" name="servicePrice[]" placeholder="请输入服务价格" required>
            </div>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // 为新添加的日期输入框添加粘贴事件监听
    const newDateInputs = newItem.querySelectorAll('input[type="date"]');
    newDateInputs.forEach(input => {
        input.addEventListener('paste', handleDatePaste);
    });
    
    // 不再设置默认日期，让用户手动选择
}

// 动态删除服务项目
function removeServiceItem(button) {
    const serviceItem = button.closest('.service-item');
    const container = document.getElementById('serviceItemsContainer');
    const items = container.querySelectorAll('.service-item');
    
    if (items.length <= 1) {
        alert('至少需要保留一个服务项目');
        return;
    }
    
    serviceItem.remove();
    
    // 重新编号
    const remainingItems = container.querySelectorAll('.service-item');
    remainingItems.forEach((item, index) => {
        item.setAttribute('data-index', index);
        item.querySelector('h4').innerHTML = `服务项目 ${index + 1}
            <button type="button" class="remove-service" onclick="removeServiceItem(this)">×</button>`;
    });
}
const contractTemplate = {
    generate: function(data) {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        };
        
        // 收集所有服务项目
        const serviceItems = [];
        const orderNumbers = data.orderNumber || [];
        const productNames = data.productName || [];
        const quantities = data.quantity || [];
        const serviceStartDates = data.serviceStartDate || [];
        const serviceEndDates = data.serviceEndDate || [];
        const servicePrices = data.servicePrice || [];
        
        for (let i = 0; i < orderNumbers.length; i++) {
            serviceItems.push({
                orderNumber: orderNumbers[i] || '',
                productName: productNames[i] || '',
                quantity: quantities[i] || '',
                serviceStartDate: serviceStartDates[i] || '',
                serviceEndDate: serviceEndDates[i] || '',
                servicePrice: servicePrices[i] || 0
            });
        }
        
        // 计算总价
        const totalPrice = serviceItems.reduce((sum, item) => sum + parseFloat(item.servicePrice || 0), 0);
        
        let serviceTableRows = '';
        serviceItems.forEach((item, index) => {
            serviceTableRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.orderNumber}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: left;">${item.productName}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${formatDate(item.serviceStartDate)}至${formatDate(item.serviceEndDate)}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">￥${item.servicePrice}元</td>
                </tr>
            `;
        });
        
        return `
            <h3>"食堂有饭"软件系统服务补充协议</h3>
            
            <p><strong>甲 方：</strong>${data.partyA}</p>
            <p><strong>地 址：</strong>${data.partyAAddress}</p>
            <p><strong>联系人：</strong>${data.partyAContact}</p>
            <p><strong>联系电话：</strong>${data.partyAPhone}</p>
            
            <p><strong>乙 方：</strong>${data.partyB}</p>
            <p><strong>地 址：</strong>${data.partyBAddress}</p>
            <p><strong>联系人：</strong>${data.partyBContact}</p>
            <p><strong>联系电话：</strong>${data.partyBPhone}</p>
            
            <p><strong>一、</strong>甲方为"食堂有饭"系统ID为<strong> ${data.canteenId} </strong>食堂账号的实际使用人和责任人，有义务妥善管理该账号权限。甲方有权向乙方申请主管理员变更。若甲方因未妥善管理该账号权限导致账号权益受损，包括但不限于设置改变、数据错误或丢失，乙方概不负责。</p>
            
            <p><strong>二、</strong>上述食堂账号的注册、试用、使用和续存引发的双方权利和义务，以甲方所授权的注册人线上点击确认的《食堂有饭服务条款》及《食堂有饭隐私保护指引》为准，本协议为线上《食堂有饭服务条款》及《食堂有饭隐私保护指引》的补充。甲方变更授权不影响双方履约义务。</p>
            
            <p><strong>三、</strong>甲方通过上述账号订购乙方提供的如下产品/服务的期限使用权：</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #000;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">序号</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">订单号</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">产品/服务名称</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">数量/单位</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">期限</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">价格</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceTableRows}
                    <tr style="font-weight: bold;">
                        <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: center;">合计</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">￥${totalPrice}元（大写：人民币${this.numberToChinese(totalPrice)}元整）</td>
                    </tr>
                </tbody>
            </table>
            
            <p class="no-indent"><strong>注：</strong>以上价格为含税价格</p>
            
            <p><strong>四、</strong>协议履行期间，甲方增补购买产品或服务造成本协议第三条所约定的内容发生改变的，以线上订单为准，不再另行签约；协议到期后，若甲方继续使用乙方提供的产品和服务，可通过续费方式线上下单，并有权重新选择续费项目。乙方根据新的订单提供相应服务，不再另行签约。</p>
            
            <p><strong>五、</strong>经双方确认，甲方应于 <strong>${formatDate(data.paymentDeadline)}</strong> 前支付本协议第三条所列全部款项。甲方可通过其食堂管理后台的支付入口及支付方式交付款项，也可将款项通过银行转帐方式支付至乙方指定的以下账户：</p>
            
            <p class="no-indent">
                <strong>开户名称：</strong>福建尚汇信息科技有限公司<br>
                <strong>开户行：</strong>中国建设银行股份有限公司漳州东城支行<br>
                <strong>账号：</strong>3505 0166 8107 0000 1235
            </p>
            
            <p><strong>六、</strong>本协议一式贰份，甲乙双方各持壹份，自双方共同签订之日起生效。</p>
            
            <div style="margin-top: 60px; width: 100%;">
                <div style="margin-bottom: 40px;">
                    <p style="margin-bottom: 10px; font-weight: bold; word-wrap: break-word; line-height: 1.6;">
                        甲方（盖章）：${data.partyA}
                    </p>
                    <p style="margin-bottom: 10px;">
                        日期：&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日
                    </p>
                </div>
                
                <div>
                    <p style="margin-bottom: 10px; font-weight: bold; word-wrap: break-word; line-height: 1.6;">
                        乙方（盖章）：${data.partyB}
                    </p>
                    <p>
                        日期：&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日
                    </p>
                </div>
            </div>
        `;
    },
    
    numberToChinese: function(num) {
        const chineseNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const chineseUnit = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
        
        let str = Math.round(num).toString();
        let result = '';
        
        for (let i = 0; i < str.length; i++) {
            const n = parseInt(str[i]);
            const unit = chineseUnit[str.length - 1 - i];
            result += chineseNum[n] + unit;
        }
        
        return result.replace(/零[拾佰仟]/g, '零').replace(/零+万/g, '万').replace(/零+亿/g, '亿').replace(/亿万/g, '亿').replace(/零+/g, '零').replace(/零$/, '');
    }
};

// 表单提交处理
document.getElementById('contractForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    
    // 收集基本信息
    data.partyA = formData.get('partyA') || '';
    data.partyAAddress = formData.get('partyAAddress') || '';
    data.partyAContact = formData.get('partyAContact') || '';
    data.partyAPhone = formData.get('partyAPhone') || '';
    data.partyB = formData.get('partyB') || '';
    data.partyBAddress = formData.get('partyBAddress') || '';
    data.partyBContact = formData.get('partyBContact') || '';
    data.partyBPhone = formData.get('partyBPhone') || '';
    data.canteenId = formData.get('canteenId') || '';
    data.paymentDeadline = formData.get('paymentDeadline') || '';
    
    // 收集服务项目和日期数组
    data.orderNumber = formData.getAll('orderNumber[]');
    data.productName = formData.getAll('productName[]');
    data.quantity = formData.getAll('quantity[]');
    data.serviceStartDate = formData.getAll('serviceStartDate[]');
    data.serviceEndDate = formData.getAll('serviceEndDate[]');
    data.servicePrice = formData.getAll('servicePrice[]');
    
    // 生成合同内容
    const contractContent = contractTemplate.generate(data);
    
    // 显示合同预览
    document.getElementById('contractPreview').innerHTML = contractContent;
    
    // 在移动设备上滚动到预览区域
    if (window.innerWidth < 768) {
        document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示默认合同模板
    showDefaultContract();
    
    // 为所有日期输入框添加粘贴事件监听
    setupDatePasteHandlers();
    
    // 注释掉：禁用导出PDF按钮
    // document.getElementById('exportPDF').disabled = true;
    // document.getElementById('exportPDF').style.opacity = '0.5';
    // document.getElementById('exportPDF').style.cursor = 'not-allowed';
    
    // 不再自动设置任何日期，让用户手动选择
    // 服务项目开始日期、结束日期和付款截止日期都留空
});

// 显示默认合同模板
function showDefaultContract() {
    const defaultData = {
        partyA: '__________',
        partyAAddress: '__________',
        partyAContact: '__________',
        partyAPhone: '__________',
        partyB: '福建尚汇信息科技有限公司',
        partyBAddress: '福建省漳州高新区西桥街道桥南国道南路24号',
        partyBContact: '__________',
        partyBPhone: '4009-180-190',
        canteenId: '__________',
        paymentDeadline: '',
        orderNumber: ['__________'],
        productName: ['__________'],
        quantity: ['__'],
        serviceStartDate: ['__________'],
        serviceEndDate: ['__________'],
        servicePrice: ['__________']
    };
    
    const contractContent = contractTemplate.generate(defaultData);
    document.getElementById('contractPreview').innerHTML = contractContent;
}