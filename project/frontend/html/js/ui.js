/* ============================================
   UI SERVICE - Manipulación del DOM y eventos
   ============================================ */

class UIService {

    // ── Mostrar mensaje de error ──
    static showError(message, elementId = null) {
        if (elementId) {
            const errorEl = document.getElementById(elementId);
            if (errorEl) {
                // Soporte para el nuevo HTML del login que tiene <span id="errorText"> adentro
                const textSpan = document.getElementById('errorText');
                if (textSpan) {
                    textSpan.textContent = message;
                } else {
                    errorEl.textContent = message;
                }
                errorEl.classList.add('show');
                setTimeout(function() {
                    errorEl.classList.remove('show');
                }, 5000);
            }
        } else {
            UIService.showToast(message, 'error');
        }
    }

    // ── Mostrar mensaje de éxito (toast visual) ──
    static showSuccess(message) {
        UIService.showToast(message, 'success');
    }

    // ── Sistema de Toast notifications ──
    static showToast(message, type) {
        type = type || 'success';

        // Crear contenedor si no existe
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = [
                'position:fixed',
                'top:20px',
                'right:20px',
                'z-index:9999',
                'display:flex',
                'flex-direction:column',
                'gap:8px',
                'pointer-events:none'
            ].join(';');
            document.body.appendChild(container);
        }

        var colors = {
            success: { bg:'#eaf3ea', border:'#2f6b55', text:'#2f6b55', icon:'ti-circle-check' },
            error:   { bg:'#fee2e2', border:'#dc2626', text:'#dc2626', icon:'ti-circle-x'     },
            warning: { bg:'#fef3c7', border:'#d97706', text:'#d97706', icon:'ti-alert-circle'  },
            info:    { bg:'#dbeafe', border:'#1d4ed8', text:'#1d4ed8', icon:'ti-info-circle'   }
        };

        var c = colors[type] || colors.success;

        var toast = document.createElement('div');
        toast.style.cssText = [
            'display:flex',
            'align-items:center',
            'gap:10px',
            'padding:12px 16px',
            'background:' + c.bg,
            'border:1.5px solid ' + c.border,
            'border-radius:10px',
            'font-family:Segoe UI,sans-serif',
            'font-size:13px',
            'font-weight:600',
            'color:' + c.text,
            'box-shadow:0 4px 16px rgba(0,0,0,0.12)',
            'pointer-events:all',
            'animation:toastIn 0.25s ease',
            'min-width:260px',
            'max-width:360px'
        ].join(';');

        toast.innerHTML = '<i class="ti ' + c.icon + '" style="font-size:18px;flex-shrink:0"></i>' +
            '<span style="flex:1">' + message + '</span>';

        // Agregar estilo de animación si no existe
        if (!document.getElementById('toastStyle')) {
            var style = document.createElement('style');
            style.id = 'toastStyle';
            style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}' +
                '@keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}';
            document.head.appendChild(style);
        }

        container.appendChild(toast);

        // Auto-remover con animación
        setTimeout(function() {
            toast.style.animation = 'toastOut 0.25s ease forwards';
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 250);
        }, 3500);
    }

    // ── Mostrar loading ──
    static showLoading(show, elementId) {
        show = show !== false;
        if (elementId) {
            var el = document.getElementById(elementId);
            if (el) el.style.display = show ? 'flex' : 'none';
        }
    }

    // ── Llenar tabla con datos ──
    static fillTable(tableId, data, columns) {
        var tbody = document.querySelector('#' + tableId + ' tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="' + columns.length + '" style="text-align:center;padding:20px;color:#94a3b8">No hay datos</td></tr>';
            return;
        }
        data.forEach(function(row) {
            var tr = document.createElement('tr');
            columns.forEach(function(col) {
                var td = document.createElement('td');
                td.textContent = row[col.field] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // ── Filtrar tabla por texto ──
    static filterTable(tableId, query) {
        var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
        if (!rows) return;
        var normalized = query.trim().toLowerCase();
        rows.forEach(function(row) {
            var text = row.textContent.toLowerCase();
            row.style.display = normalized === '' || text.includes(normalized) ? '' : 'none';
        });
    }

    // ── Filtrar tabla por estado ──
    static filterTableByStatus(tableId, status) {
        var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
        if (!rows) return;
        rows.forEach(function(row) {
            var value = row.cells[7] ? row.cells[7].textContent.trim() : '';
            row.style.display = status === 'all' || value === status ? '' : 'none';
        });
    }

    // ── Reset filtros de tabla ──
    static resetTableFilters(tableId) {
        var rows = document.querySelectorAll('#' + tableId + ' tbody tr');
        if (!rows) return;
        rows.forEach(function(row) { row.style.display = ''; });
    }

    // ── Toggle botón de estado ──
    static toggleStatusButton(button) {
        var siblings = button.parentElement ? button.parentElement.querySelectorAll('.status-toggle') : [];
        siblings.forEach(function(btn) { btn.classList.remove('active'); });
        button.classList.add('active');
    }

    // ── Toggle botón de acceso ──
    static toggleAccessButton(button) {
        button.classList.toggle('active');
    }

    // ── Modal ──
    static openModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.add('show');
    }

    static closeModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
    }

    // ── Formulario ──
    static clearForm(formId) {
        var form = document.getElementById(formId);
        if (form) form.reset();
    }

    static getFormData(formId) {
        var form = document.getElementById(formId);
        if (!form) return null;
        var formData = new FormData(form);
        var data = {};
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        return data;
    }

    // ── Llenar select ──
    static fillSelect(selectId, options, valueField, labelField) {
        valueField = valueField || 'id';
        labelField = labelField || 'name';
        var select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">-- Seleccionar --</option>';
        options.forEach(function(option) {
            var opt = document.createElement('option');
            opt.value = option[valueField];
            opt.textContent = option[labelField];
            select.appendChild(opt);
        });
    }

    // ── Formatear fecha ──
    static formatDate(date) {
        if (!date) return '';
        var d = new Date(date);
        return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES');
    }

    static formatTime(date) {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('es-ES');
    }

    // ── Utilidades ──
    static confirm(message) { return confirm(message); }

    static disableButton(buttonId) {
        var btn = document.getElementById(buttonId);
        if (btn) btn.disabled = true;
    }

    static enableButton(buttonId) {
        var btn = document.getElementById(buttonId);
        if (btn) btn.disabled = false;
    }

    static updateText(elementId, text) {
        var el = document.getElementById(elementId);
        if (el) el.textContent = text;
    }

    static toggleVisibility(elementId, show) {
        var el = document.getElementById(elementId);
        if (el) el.style.display = show !== false ? 'block' : 'none';
    }

    static addClass(elementId, className) {
        var el = document.getElementById(elementId);
        if (el) el.classList.add(className);
    }

    static removeClass(elementId, className) {
        var el = document.getElementById(elementId);
        if (el) el.classList.remove(className);
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static isFieldEmpty(fieldId) {
        var field = document.getElementById(fieldId);
        return !field || field.value.trim() === '';
    }

    static scrollTo(elementId) {
        var el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}