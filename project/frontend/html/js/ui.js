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

    // ── Toasts: los estilos viven en global.css (.toast, .toast-success, ...) ──
    static showToast(message, type) {
        var tipos = ['success', 'error', 'warning', 'info'];
        type = tipos.indexOf(type) !== -1 ? type : 'success';

        var iconos = {
            success: 'ti-circle-check',
            error:   'ti-circle-x',
            warning: 'ti-alert-triangle',
            info:    'ti-info-circle'
        };

        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        var duracion = type === 'error' ? 5000 : 3500;

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.style.setProperty('--toast-ms', duracion + 'ms');

        var icono = document.createElement('i');
        icono.className = 'ti ' + iconos[type] + ' toast-icon';
        icono.setAttribute('aria-hidden', 'true');

        var cuerpo = document.createElement('span');
        cuerpo.className = 'toast-body';
        cuerpo.textContent = message;

        var barra = document.createElement('span');
        barra.className = 'toast-progress';

        toast.appendChild(icono);
        toast.appendChild(cuerpo);
        toast.appendChild(barra);
        container.appendChild(toast);

        var cerrado = false;
        function cerrar() {
            if (cerrado) return;
            cerrado = true;
            toast.classList.add('is-leaving');
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 240);
        }

        toast.addEventListener('click', cerrar);
        setTimeout(cerrar, duracion);
    }

    // ── Ventana de confirmación propia (reemplaza a confirm()) ──
    // Devuelve una promesa: true si confirma, false si cancela, pulsa Esc o hace clic fuera.
    static confirmDialog(opts) {
        opts = opts || {};
        return new Promise(function(resolve) {
            var anterior = document.activeElement;
            var peligro = opts.danger === true;
            var uid = 'cd' + Date.now();

            var fondo = document.createElement('div');
            fondo.className = 'modal-backdrop';

            var dialogo = document.createElement('div');
            dialogo.className = 'modal-dialog confirm-dialog' + (peligro ? ' is-danger' : '');
            dialogo.setAttribute('role', 'alertdialog');
            dialogo.setAttribute('aria-modal', 'true');
            dialogo.setAttribute('aria-labelledby', uid + 't');
            dialogo.setAttribute('aria-describedby', uid + 'm');

            var icono = document.createElement('div');
            icono.className = 'confirm-icon';
            icono.innerHTML = '<i class="ti ' + (peligro ? 'ti-alert-triangle' : 'ti-help-circle') + '" aria-hidden="true"></i>';

            var titulo = document.createElement('h3');
            titulo.className = 'confirm-title';
            titulo.id = uid + 't';
            titulo.textContent = opts.title || 'Confirmar acción';

            var mensaje = document.createElement('p');
            mensaje.className = 'confirm-message';
            mensaje.id = uid + 'm';
            mensaje.textContent = opts.message || '';

            var acciones = document.createElement('div');
            acciones.className = 'confirm-actions';

            var cancelar = document.createElement('button');
            cancelar.type = 'button';
            cancelar.className = 'btn-ghost';
            cancelar.textContent = opts.cancelText || 'Cancelar';

            var aceptar = document.createElement('button');
            aceptar.type = 'button';
            aceptar.className = peligro ? 'btn-danger' : 'btn-primary';
            aceptar.textContent = opts.confirmText || 'Aceptar';

            acciones.appendChild(cancelar);
            acciones.appendChild(aceptar);
            dialogo.appendChild(icono);
            dialogo.appendChild(titulo);
            dialogo.appendChild(mensaje);
            dialogo.appendChild(acciones);
            fondo.appendChild(dialogo);
            document.body.appendChild(fondo);

            var cerrado = false;
            function cerrar(resultado) {
                if (cerrado) return;
                cerrado = true;
                document.removeEventListener('keydown', teclado, true);
                fondo.classList.remove('is-visible');
                if (anterior && typeof anterior.focus === 'function') anterior.focus();
                setTimeout(function() {
                    if (fondo.parentNode) fondo.parentNode.removeChild(fondo);
                }, 260);
                resolve(resultado);
            }

            function teclado(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    cerrar(false);
                } else if (e.key === 'Tab') {
                    // El foco se queda dentro de la ventana
                    var primero = cancelar;
                    var ultimo = aceptar;
                    if (e.shiftKey && document.activeElement === primero) {
                        e.preventDefault();
                        ultimo.focus();
                    } else if (!e.shiftKey && document.activeElement === ultimo) {
                        e.preventDefault();
                        primero.focus();
                    }
                }
            }

            cancelar.addEventListener('click', function() { cerrar(false); });
            aceptar.addEventListener('click', function() { cerrar(true); });
            fondo.addEventListener('mousedown', function(e) {
                if (e.target === fondo) cerrar(false);
            });
            document.addEventListener('keydown', teclado, true);

            requestAnimationFrame(function() {
                fondo.classList.add('is-visible');
                (peligro ? cancelar : aceptar).focus();
            });
        });
    }

    // ── Estado vacío o de error dentro de un contenedor o <tbody> ──
    // opts: { icon: 'ti-search-off', title: '...', text: '...', error: false }
    static renderEmptyState(target, opts) {
        if (!target) return;
        opts = opts || {};

        var caja = document.createElement('div');
        caja.className = 'empty-state' + (opts.error ? ' is-error' : '');

        var icono = document.createElement('div');
        icono.className = 'empty-state-icon';
        icono.innerHTML = '<i class="ti ' + (opts.icon || 'ti-inbox') + '" aria-hidden="true"></i>';
        caja.appendChild(icono);

        var titulo = document.createElement('div');
        titulo.className = 'empty-state-title';
        titulo.textContent = opts.title || 'Sin resultados';
        caja.appendChild(titulo);

        if (opts.text) {
            var texto = document.createElement('div');
            texto.className = 'empty-state-text';
            texto.textContent = opts.text;
            caja.appendChild(texto);
        }

        target.innerHTML = '';

        if (target.tagName === 'TBODY') {
            var tabla = target.closest('table');
            var columnas = tabla ? tabla.querySelectorAll('thead th').length : 1;
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.colSpan = Math.max(columnas, 1);
            td.appendChild(caja);
            tr.appendChild(td);
            target.appendChild(tr);
        } else {
            target.appendChild(caja);
        }
    }

    // ── Filas de esqueleto mientras llegan los datos ──
    static renderSkeletonRows(tbody, cols, rows) {
        if (!tbody) return;
        cols = cols || 4;
        rows = rows || 5;
        tbody.innerHTML = '';
        for (var r = 0; r < rows; r++) {
            var tr = document.createElement('tr');
            tr.className = 'is-skeleton';
            for (var c = 0; c < cols; c++) {
                var td = document.createElement('td');
                var barra = document.createElement('span');
                barra.className = 'skeleton skeleton-line';
                barra.style.width = (55 + ((r + c) % 4) * 10) + '%';
                td.appendChild(barra);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    // ── Tablas que se vuelven tarjetas en celular ──
    // Pone data-label en cada celda copiando el texto del encabezado y vuelve a hacerlo
    // cada vez que la página llena la tabla de nuevo.
    static enableResponsiveTables(root) {
        root = root || document;
        root.querySelectorAll('table').forEach(function(table) {
            if (table.dataset.rt) return;
            table.dataset.rt = '1';
            table.classList.add('rt');
            UIService._etiquetarTabla(table);
            var tbody = table.tBodies[0];
            if (tbody) {
                new MutationObserver(function() {
                    UIService._etiquetarTabla(table);
                }).observe(tbody, { childList: true });
            }
        });
    }

    static _etiquetarTabla(table) {
        var etiquetas = Array.prototype.map.call(table.querySelectorAll('thead th'), function(th) {
            return th.textContent.trim();
        });
        table.querySelectorAll('tbody tr').forEach(function(tr) {
            var indice = 0;
            Array.prototype.forEach.call(tr.children, function(td) {
                if (td.tagName !== 'TD') return;
                var ancho = td.colSpan || 1;
                if (ancho > 1) {
                    td.classList.add('rt-empty');
                    td.setAttribute('data-label', '');
                } else if (!td.hasAttribute('data-label')) {
                    td.setAttribute('data-label', etiquetas[indice] || '');
                }
                indice += ancho;
            });
        });
    }

    // ── Contador animado (respeta "reducir movimiento") ──
    static countUp(el, to, ms) {
        if (!el) return;
        var destino = Number(to);
        var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!isFinite(destino) || reducir) {
            el.textContent = to;
            return;
        }
        ms = ms || 900;
        var inicio = null;
        function paso(t) {
            if (inicio === null) inicio = t;
            var avance = Math.min((t - inicio) / ms, 1);
            var suave = 1 - Math.pow(1 - avance, 3);
            el.textContent = Math.round(destino * suave);
            if (avance < 1) {
                requestAnimationFrame(paso);
            } else {
                el.textContent = destino;
            }
        }
        requestAnimationFrame(paso);
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
            UIService.renderEmptyState(tbody, { icon: 'ti-database-off', title: 'No hay datos' });
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
