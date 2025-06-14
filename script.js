
// Form Builder JavaScript
class FormBuilder {
    constructor() {
        this.formElements = [];
        this.elementCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Drag and drop for toolbox elements
        const toolboxElements = document.querySelectorAll('.element-item');
        toolboxElements.forEach(element => {
            element.addEventListener('dragstart', this.handleDragStart.bind(this));
        });

        // Canvas drop zone
        const canvas = document.getElementById('formCanvas');
        canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        canvas.addEventListener('drop', this.handleDrop.bind(this));
        canvas.addEventListener('dragenter', this.handleDragEnter.bind(this));
        canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));

        // Export buttons
        document.getElementById('exportJson').addEventListener('click', this.exportAsJson.bind(this));
        document.getElementById('exportHtml').addEventListener('click', this.exportAsHtml.bind(this));
        document.getElementById('clearForm').addEventListener('click', this.clearForm.bind(this));

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('copyCode').addEventListener('click', this.copyToClipboard.bind(this));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('exportModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.target.style.opacity = '0.5';
        
        // Reset opacity after drag
        setTimeout(() => {
            e.target.style.opacity = '1';
        }, 100);
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.closest('.canvas').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        if (!e.target.closest('.canvas').contains(e.relatedTarget)) {
            e.target.closest('.canvas').classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const canvas = e.target.closest('.canvas');
        canvas.classList.remove('drag-over');
        
        const elementType = e.dataTransfer.getData('text/plain');
        this.addFormElement(elementType);
    }

    addFormElement(type) {
        this.elementCounter++;
        const elementId = `element_${this.elementCounter}`;
        
        const elementData = {
            id: elementId,
            type: type,
            label: this.getDefaultLabel(type),
            placeholder: this.getDefaultPlaceholder(type),
            name: `field_${this.elementCounter}`
        };

        this.formElements.push(elementData);
        this.renderFormElement(elementData);
        this.updatePreview();

        // Hide drop hint
        const dropHint = document.querySelector('.drop-hint');
        if (dropHint) {
            dropHint.style.display = 'none';
        }
    }

    getDefaultLabel(type) {
        const labels = {
            text: 'Text Input',
            email: 'Email Address',
            password: 'Password',
            textarea: 'Message',
            checkbox: 'Check this option',
            radio: 'Select an option',
            select: 'Choose from dropdown'
        };
        return labels[type] || 'Form Field';
    }

    getDefaultPlaceholder(type) {
        const placeholders = {
            text: 'Enter text here...',
            email: 'Enter your email...',
            password: 'Enter your password...',
            textarea: 'Enter your message here...',
            select: 'Choose an option'
        };
        return placeholders[type] || '';
    }

    renderFormElement(elementData) {
        const canvas = document.getElementById('formCanvas');
        const elementDiv = document.createElement('div');
        elementDiv.className = 'form-element';
        elementDiv.dataset.id = elementData.id;

        let elementHTML = '';
        
        switch (elementData.type) {
            case 'text':
            case 'email':
            case 'password':
                elementHTML = `
                    <label>${elementData.label}</label>
                    <input type="${elementData.type}" placeholder="${elementData.placeholder}" name="${elementData.name}">
                `;
                break;
            case 'textarea':
                elementHTML = `
                    <label>${elementData.label}</label>
                    <textarea placeholder="${elementData.placeholder}" name="${elementData.name}" rows="4"></textarea>
                `;
                break;
            case 'checkbox':
                elementHTML = `
                    <div class="checkbox-group">
                        <input type="checkbox" name="${elementData.name}" id="${elementData.id}_input">
                        <label for="${elementData.id}_input">${elementData.label}</label>
                    </div>
                `;
                break;
            case 'radio':
                elementHTML = `
                    <label>${elementData.label}</label>
                    <div class="radio-group">
                        <input type="radio" name="${elementData.name}" id="${elementData.id}_1" value="option1">
                        <label for="${elementData.id}_1">Option 1</label>
                    </div>
                    <div class="radio-group">
                        <input type="radio" name="${elementData.name}" id="${elementData.id}_2" value="option2">
                        <label for="${elementData.id}_2">Option 2</label>
                    </div>
                `;
                break;
            case 'select':
                elementHTML = `
                    <label>${elementData.label}</label>
                    <select name="${elementData.name}">
                        <option value="">${elementData.placeholder}</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                `;
                break;
        }

        elementDiv.innerHTML = `
            ${elementHTML}
            <button class="remove-btn" onclick="formBuilder.removeElement('${elementData.id}')">&times;</button>
        `;

        canvas.appendChild(elementDiv);
    }

    removeElement(elementId) {
        // Remove from DOM
        const element = document.querySelector(`[data-id="${elementId}"]`);
        element.remove();

        // Remove from form elements array
        this.formElements = this.formElements.filter(el => el.id !== elementId);

        // Update preview
        this.updatePreview();

        // Show drop hint if no elements
        if (this.formElements.length === 0) {
            const dropHint = document.querySelector('.drop-hint');
            if (dropHint) {
                dropHint.style.display = 'block';
            }
        }
    }

    updatePreview() {
        const previewContent = document.querySelector('.preview-content');
        
        if (this.formElements.length === 0) {
            previewContent.innerHTML = '<p class="preview-hint">Your form preview will appear here...</p>';
            return;
        }

        let previewHTML = '<form class="preview-form">';
        
        this.formElements.forEach(element => {
            previewHTML += '<div class="preview-field">';
            
            switch (element.type) {
                case 'text':
                case 'email':
                case 'password':
                    previewHTML += `
                        <label>${element.label}</label>
                        <input type="${element.type}" placeholder="${element.placeholder}" name="${element.name}">
                    `;
                    break;
                case 'textarea':
                    previewHTML += `
                        <label>${element.label}</label>
                        <textarea placeholder="${element.placeholder}" name="${element.name}" rows="4"></textarea>
                    `;
                    break;
                case 'checkbox':
                    previewHTML += `
                        <div class="checkbox-group">
                            <input type="checkbox" name="${element.name}" id="preview_${element.id}">
                            <label for="preview_${element.id}">${element.label}</label>
                        </div>
                    `;
                    break;
                case 'radio':
                    previewHTML += `
                        <label>${element.label}</label>
                        <div class="radio-group">
                            <input type="radio" name="${element.name}" id="preview_${element.id}_1" value="option1">
                            <label for="preview_${element.id}_1">Option 1</label>
                        </div>
                        <div class="radio-group">
                            <input type="radio" name="${element.name}" id="preview_${element.id}_2" value="option2">
                            <label for="preview_${element.id}_2">Option 2</label>
                        </div>
                    `;
                    break;
                case 'select':
                    previewHTML += `
                        <label>${element.label}</label>
                        <select name="${element.name}">
                            <option value="">${element.placeholder}</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                    `;
                    break;
            }
            
            previewHTML += '</div>';
        });
        
        previewHTML += '<button type="submit" class="button" style="margin-top: 20px;">Submit Form</button>';
        previewHTML += '</form>';
        
        previewContent.innerHTML = previewHTML;
    }

    exportAsJson() {
        const jsonData = {
            formName: "Custom Form",
            elements: this.formElements.map(el => ({
                type: el.type,
                label: el.label,
                name: el.name,
                placeholder: el.placeholder || null
            }))
        };

        this.showModal('Export as JSON', JSON.stringify(jsonData, null, 2));
    }

    exportAsHtml() {
        let htmlCode = '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Custom Form</title>\n    <style>\n        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }\n        .form-field { margin-bottom: 20px; }\n        label { display: block; margin-bottom: 5px; font-weight: bold; }\n        input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }\n        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }\n        .checkbox-group, .radio-group { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }\n        .checkbox-group input, .radio-group input { width: auto; }\n    </style>\n</head>\n<body>\n    <h1>Custom Form</h1>\n    <form>\n';

        this.formElements.forEach(element => {
            htmlCode += '        <div class="form-field">\n';
            
            switch (element.type) {
                case 'text':
                case 'email':
                case 'password':
                    htmlCode += `            <label for="${element.name}">${element.label}</label>\n`;
                    htmlCode += `            <input type="${element.type}" id="${element.name}" name="${element.name}" placeholder="${element.placeholder}">\n`;
                    break;
                case 'textarea':
                    htmlCode += `            <label for="${element.name}">${element.label}</label>\n`;
                    htmlCode += `            <textarea id="${element.name}" name="${element.name}" placeholder="${element.placeholder}" rows="4"></textarea>\n`;
                    break;
                case 'checkbox':
                    htmlCode += `            <div class="checkbox-group">\n`;
                    htmlCode += `                <input type="checkbox" id="${element.name}" name="${element.name}">\n`;
                    htmlCode += `                <label for="${element.name}">${element.label}</label>\n`;
                    htmlCode += `            </div>\n`;
                    break;
                case 'radio':
                    htmlCode += `            <label>${element.label}</label>\n`;
                    htmlCode += `            <div class="radio-group">\n`;
                    htmlCode += `                <input type="radio" id="${element.name}_1" name="${element.name}" value="option1">\n`;
                    htmlCode += `                <label for="${element.name}_1">Option 1</label>\n`;
                    htmlCode += `            </div>\n`;
                    htmlCode += `            <div class="radio-group">\n`;
                    htmlCode += `                <input type="radio" id="${element.name}_2" name="${element.name}" value="option2">\n`;
                    htmlCode += `                <label for="${element.name}_2">Option 2</label>\n`;
                    htmlCode += `            </div>\n`;
                    break;
                case 'select':
                    htmlCode += `            <label for="${element.name}">${element.label}</label>\n`;
                    htmlCode += `            <select id="${element.name}" name="${element.name}">\n`;
                    htmlCode += `                <option value="">${element.placeholder}</option>\n`;
                    htmlCode += `                <option value="option1">Option 1</option>\n`;
                    htmlCode += `                <option value="option2">Option 2</option>\n`;
                    htmlCode += `                <option value="option3">Option 3</option>\n`;
                    htmlCode += `            </select>\n`;
                    break;
            }
            
            htmlCode += '        </div>\n';
        });
        
        htmlCode += '        <button type="submit">Submit Form</button>\n    </form>\n</body>\n</html>';
        
        this.showModal('Export as HTML', htmlCode);
    }

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('exportCode').value = content;
        document.getElementById('exportModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('exportModal').style.display = 'none';
    }

    copyToClipboard() {
        const exportCode = document.getElementById('exportCode');
        exportCode.select();
        exportCode.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            const copyBtn = document.getElementById('copyCode');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = '#4caf50';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        } catch (err) {
            alert('Failed to copy to clipboard. Please select and copy manually.');
        }
    }

    clearForm() {
        if (this.formElements.length === 0) return;
        
        if (confirm('Are you sure you want to clear the entire form? This action cannot be undone.')) {
            this.formElements = [];
            this.elementCounter = 0;
            
            const canvas = document.getElementById('formCanvas');
            canvas.innerHTML = '<p class="drop-hint">Drop form elements here to build your form</p>';
            
            this.updatePreview();
        }
    }
}

// Initialize the form builder when the page loads
const formBuilder = new FormBuilder();
