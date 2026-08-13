/* ==========================================
   DATOS GENERALES DE CURSOS (ESTRUCTURA DE 3 UNIDADES)
   ========================================== */
let cursosData = [
  {
    id: 1,
    nombre: "Matemática",
    tipoCalculo: "promedio",
    sustitutorio: "",
    aplazado: "",
    unidades: [
      { nombre: "Unidad 1", peso: 33.33, evaluaciones: [{ nombre: "Examen 1", peso: 100, nota: 14.5 }] },
      { nombre: "Unidad 2", peso: 33.33, evaluaciones: [{ nombre: "Examen 2", peso: 100, nota: 10.0 }] },
      { nombre: "Unidad 3", peso: 33.34, evaluaciones: [{ nombre: "Examen 3", peso: 100, nota: 12.0 }] }
    ]
  }
];

let temasPlan = [
  { id: 1, nombre: "Tema 1: Conceptos Básicos", completado: false },
  { id: 2, nombre: "Tema 2: Ejercicios Avanzados", completado: false }
];

let tareas = [];
let finanzas = [];
let recursos = [];
let horarioClases = [];

let miGraficoProgreso = null;
let calendarInstance = null;

const listaColoresDisponibles = [
  { id: "c1", hex: "#3b82f6" },
  { id: "c2", hex: "#10b981" },
  { id: "c3", hex: "#ec4899" },
  { id: "c4", hex: "#8b5cf6" },
  { id: "c5", hex: "#f59e0b" },
  { id: "c6", hex: "#06b6d4" },
  { id: "c7", hex: "#e11d48" }
];

let coloresUsados = new Set();
const audioAprobado = new Audio("Get Lucky (feat. Pharrell Williams and Nile Rodgers).mp3");

/* ==========================================
   FRASES DE MOTIVACIÓN Y ROTACIÓN AUTOMÁTICA
   ========================================== */
const frasesPeliculas = [
  { texto: '"Si no te gusta tu destino, no lo aceptes. Ten el valor de cambiarlo como quieres que sea."', pelicula: "— Naruto Uzumaki (Naruto)" },
  { texto: '"Levanta la cabeza, sigue adelante. Tienes piernas para ponerte de pie."', pelicula: "— Edward Elric (Fullmetal Alchemist)" },
  { texto: '"No tiene sentido trabajar duro si no crees en ti mismo."', pelicula: "— Might Guy (Naruto)" },
  { texto: '"El trabajo duro supera al talento natural cuando el talento no trabaja duro."', pelicula: "— Rock Lee (Naruto)" },
  { texto: '"Incluso los momentos más oscuros pueden ser iluminados si uno recuerda encender la luz."', pelicula: "— Albus Dumbledore (Harry Potter)" },
  { texto: '"Nuestra mayor gloria no está en no caer nunca, sino en levantarnos cada vez que caemos."', pelicula: "— Confucio" },
  { texto: '"El éxito es la suma de pequeños esfuerzos repetidos día tras día."', pelicula: "— Robert Collier" }
];

const paletaColoresFrase = [
  "#60a5fa", "#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#22d3ee", "#f87171"
];

let intervaloFrases = null;

function generarNuevaFrase() {
  const elemTexto = document.getElementById('quote-texto');
  const elemAutor = document.getElementById('quote-pelicula');
  const pomoTexto = document.getElementById('pomo-frase-texto');
  const pomoAutor = document.getElementById('pomo-frase-autor');

  const idxFrase = Math.floor(Math.random() * frasesPeliculas.length);
  const idxColor = Math.floor(Math.random() * paletaColoresFrase.length);

  const frase = frasesPeliculas[idxFrase];
  const color = paletaColoresFrase[idxColor];

  // Actualiza frase del módulo normal
  if (elemTexto && elemAutor) {
    elemTexto.textContent = frase.texto;
    elemTexto.style.color = color;
    elemAutor.textContent = frase.pelicula;
  }

  // Actualiza frase del Pomodoro Gigante
  if (pomoTexto && pomoAutor) {
    pomoTexto.textContent = frase.texto;
    pomoTexto.style.color = color;
    pomoAutor.textContent = frase.pelicula;
  }
}

// Iniciar cambio automático de frases cada 12 segundos
function iniciarRotacionFrases() {
  generarNuevaFrase();
  if (!intervaloFrases) {
    intervaloFrases = setInterval(generarNuevaFrase, 12000);
  }
}

/* ==========================================
   INICIALIZACIÓN
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  inicializarCalendario24h();
  renderizarCursos();
  configurarEventosFormularios();
  renderColorPicker();
  renderTemasPlan();
  inicializarGraficoProgreso();
  iniciarRotacionFrases();
});

/* ==========================================
   NAVEGACIÓN ENTRE FICHEROS Y MÓDULOS
   ========================================== */
function abrirModulo(idModulo) {
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  
  const moduloSeleccionado = document.getElementById(idModulo);
  if (moduloSeleccionado) {
    moduloSeleccionado.classList.add('activo');
  }

  if (idModulo === 'calendario' && calendarInstance) {
    setTimeout(() => {
      calendarInstance.render();
    }, 100);
  }
}

function volverAlMenu() {
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  
  const menuFicheros = document.getElementById('menu-ficheros');
  if (menuFicheros) {
    menuFicheros.classList.add('activo');
  }
}

/* ==========================================
   POMODORO, MÚSICA Y VENTANA GIGANTE
   ========================================== */
let pomoInterval = null;
let pomoTiempo = 25 * 60;
let esModoDescanso = false;

function actualizarPantallaPomodoro() {
  const mins = String(Math.floor(pomoTiempo / 60)).padStart(2, '0');
  const segs = String(pomoTiempo % 60).padStart(2, '0');
  const tiempoTexto = `${mins}:${segs}`;

  const displayNormal = document.getElementById('pomo-reloj');
  const displayGigante = document.getElementById('pomo-reloj-gigante');

  if (displayNormal) displayNormal.innerText = tiempoTexto;
  if (displayGigante) displayGigante.innerText = tiempoTexto;
}

// Selección de tiempo de TRABAJO
function seleccionarTiempoTrabajo(minutos) {
  esModoDescanso = false;
  pausarPomodoro();
  pomoTiempo = parseInt(minutos) * 60;
  
  // Sincronizar selectores del menú normal y gigante
  const selNormal = document.getElementById('pomo-trabajo');
  const selGigante = document.getElementById('pomo-trabajo-g');
  if (selNormal) selNormal.value = minutos;
  if (selGigante) selGigante.value = minutos;

  actualizarPantallaPomodoro();
}

// Selección de tiempo de DESCANSO (Corregido)
function seleccionarTiempoDescanso(minutos) {
  esModoDescanso = true;
  pausarPomodoro();
  pomoTiempo = parseInt(minutos) * 60;

  // Sincronizar selectores del menú normal y gigante
  const selNormal = document.getElementById('pomo-descanso');
  const selGigante = document.getElementById('pomo-descanso-g');
  if (selNormal) selNormal.value = minutos;
  if (selGigante) selGigante.value = minutos;

  actualizarPantallaPomodoro();
}

function abrirPomodoroGigante() {
  const modal = document.getElementById('modal-pomodoro-gigante');
  if (!modal) return;
  
  generarNuevaFrase();
  actualizarPantallaPomodoro();
  modal.classList.add('activo');
}

function cerrarPomodoroGigante() {
  const modal = document.getElementById('modal-pomodoro-gigante');
  if (modal) {
    modal.classList.remove('activo');
  }
}

function cambiarMusicaLocal(nombreArchivo) {
  const reproductor = document.getElementById('reproductor-audio');
  const selNormal = document.getElementById('select-musica-local');
  const selGigante = document.getElementById('select-musica-gigante');

  if (selNormal) selNormal.value = nombreArchivo;
  if (selGigante) selGigante.value = nombreArchivo;

  if (!reproductor) return;

  if (nombreArchivo) {
    reproductor.src = nombreArchivo;
    reproductor.play().catch(e => console.warn("Autoplay bloqueado:", e));
  } else {
    reproductor.pause();
    reproductor.src = "";
  }
}

function iniciarPomodoro() {
  if (pomoInterval) return;

  pomoInterval = setInterval(() => {
    if (pomoTiempo > 0) { 
      pomoTiempo--; 
      actualizarPantallaPomodoro(); 
    } else { 
      pausarPomodoro();
      if (!esModoDescanso) {
        alert("¡Tiempo de trabajo finalizado! Tómate un descanso.");
        esModoDescanso = true;
        const selDescanso = document.getElementById('pomo-descanso-g') || document.getElementById('pomo-descanso');
        pomoTiempo = (selDescanso ? parseInt(selDescanso.value) : 5) * 60;
      } else {
        alert("¡Descanso terminado! De vuelta al trabajo.");
        esModoDescanso = false;
        const selTrabajo = document.getElementById('pomo-trabajo-g') || document.getElementById('pomo-trabajo');
        pomoTiempo = (selTrabajo ? parseInt(selTrabajo.value) : 25) * 60;
      }
      actualizarPantallaPomodoro();
    }
  }, 1000);
}

function pausarPomodoro() {
  if (pomoInterval) {
    clearInterval(pomoInterval);
    pomoInterval = null;
  }
}

function reiniciarPomodoro() {
  pausarPomodoro();
  esModoDescanso = false;
  const selectTrabajo = document.getElementById('pomo-trabajo-g') || document.getElementById('pomo-trabajo');
  const mins = selectTrabajo ? parseInt(selectTrabajo.value) : 25;
  pomoTiempo = mins * 60;
  actualizarPantallaPomodoro();
}

/* ==========================================
   LÓGICA DE CÁLCULO Y GESTIÓN DE CURSOS
   ========================================== */
function calcularPromedioUnidad(unidad) {
  if (!unidad.evaluaciones || unidad.evaluaciones.length === 0) return 0;
  let sumaNotas = 0, sumaPesos = 0;
  unidad.evaluaciones.forEach(ev => {
    const peso = parseFloat(ev.peso) || 0;
    const nota = parseFloat(ev.nota) || 0;
    sumaNotas += nota * peso;
    sumaPesos += peso;
  });
  return sumaPesos === 0 ? 0 : sumaNotas / sumaPesos;
}

function calcularPromedioFinalCurso(curso) {
  if (!curso.unidades || curso.unidades.length === 0) return 0;
  let promediosUnidades = curso.unidades.map(u => calcularPromedioUnidad(u));

  if (curso.sustitutorio !== "" && curso.sustitutorio !== null && !isNaN(curso.sustitutorio)) {
    const notaSust = parseFloat(curso.sustitutorio);
    let minIndex = 0;
    for (let i = 1; i < promediosUnidades.length; i++) {
      if (promediosUnidades[i] < promediosUnidades[minIndex]) minIndex = i;
    }
    if (notaSust > promediosUnidades[minIndex]) promediosUnidades[minIndex] = notaSust;
  }

  let promedioBase = 0;
  if (curso.tipoCalculo === "promedio") {
    let suma = promediosUnidades.reduce((a, b) => a + b, 0);
    promedioBase = suma / promediosUnidades.length;
  } else if (curso.tipoCalculo === "ponderado") {
    let sumaPonderada = 0, sumaPesos = 0;
    curso.unidades.forEach((u, idx) => {
      const p = parseFloat(u.peso) || 0;
      sumaPonderada += promediosUnidades[idx] * p;
      sumaPesos += p;
    });
    promedioBase = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
  }

  if (curso.aplazado !== "" && curso.aplazado !== null && !isNaN(curso.aplazado)) {
    return (promedioBase + parseFloat(curso.aplazado)) / 2;
  }

  return promedioBase;
}

function renderizarCursos() {
  const contenedor = document.getElementById('contenedor-cursos');
  if (!contenedor) return;
  contenedor.innerHTML = "";

  cursosData.forEach((curso, cIndex) => {
    const promedioFinal = calcularPromedioFinalCurso(curso);
    const estaAprobado = promedioFinal >= 10.5;
    const card = document.createElement('div');
    card.className = 'card card-hover';

    card.innerHTML = `
      <button class="btn-delete-absolute btn-anim" title="Eliminar Curso" onclick="eliminarCurso(${cIndex})">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="curso-header">
        <input type="text" class="input-nombre-curso" value="${curso.nombre}" onchange="actualizarNombreCurso(${cIndex}, this.value)">
        <span class="promedio-badge ${estaAprobado ? 'badge-aprobado' : 'badge-desaprobado'}">
          ${promedioFinal.toFixed(2)}
        </span>
      </div>

      <div class="unidades-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
        ${curso.unidades.map((unidad, uIndex) => {
          const promU = calcularPromedioUnidad(unidad);
          return `
            <div style="background: var(--secondary-bg, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">
                <input type="text" value="${unidad.nombre}" style="font-weight: 600; border: none; background: transparent;" onchange="actualizarNombreUnidad(${cIndex}, ${uIndex}, this.value)">
                
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${curso.tipoCalculo === 'ponderado' ? `<input type="number" placeholder="%" value="${unidad.peso}" style="width: 45px;" onchange="actualizarPesoUnidad(${cIndex}, ${uIndex}, this.value)">` : ''}
                  <span style="color: var(--primary-color, #2563eb);">Prom: ${promU.toFixed(2)}</span>
                  <button class="btn-delete-eval btn-anim" title="Eliminar Unidad" onclick="eliminarUnidad(${cIndex}, ${uIndex})">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <div class="evaluaciones-list">
                ${unidad.evaluaciones.map((ev, eIndex) => `
                  <div class="eval-row" style="display: flex; gap: 4px; margin-bottom: 4px;">
                    <input type="text" placeholder="Eval" value="${ev.nombre}" onchange="actualizarEvalNombre(${cIndex}, ${uIndex}, ${eIndex}, this.value)">
                    <input type="number" placeholder="Peso" value="${ev.peso}" onchange="actualizarEvalPeso(${cIndex}, ${uIndex}, ${eIndex}, this.value)" style="width: 55px;">
                    <input type="number" placeholder="Nota" min="0" max="20" step="0.1" value="${ev.nota}" onchange="actualizarEvalNota(${cIndex}, ${uIndex}, ${eIndex}, this.value)" style="width: 55px;">
                    <button class="btn-delete-eval btn-anim" onclick="eliminarEvaluacion(${cIndex}, ${uIndex}, ${eIndex})">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                `).join('')}
              </div>

              <button class="btn-secondary btn-anim" style="font-size: 0.72rem; width: 100%; margin-top: 4px; padding: 3px;" onclick="agregarEvaluacion(${cIndex}, ${uIndex})">
                + Eval en ${unidad.nombre}
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <div class="form-group" style="margin-bottom: 10px;">
        <label style="font-size: 0.8rem; font-weight: 600;">Cálculo Final:</label>
        <select onchange="cambiarTipoCalculo(${cIndex}, this.value)" style="font-size: 0.85rem;">
          <option value="promedio" ${curso.tipoCalculo === 'promedio' ? 'selected' : ''}>Promedio Simple</option>
          <option value="ponderado" ${curso.tipoCalculo === 'ponderado' ? 'selected' : ''}>Porcentaje (%) por Unidad</option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px; margin-bottom: 10px;">
        <div>
          <label style="font-size: 0.75rem; display: block; font-weight: 600;">Sustitutorio:</label>
          <input type="number" placeholder="Nota" min="0" max="20" step="0.1" value="${curso.sustitutorio}" onchange="actualizarSustitutorio(${cIndex}, this.value)" style="width: 100%; padding: 4px; font-size: 0.82rem;">
        </div>
        <div>
          <label style="font-size: 0.75rem; display: block; font-weight: 600;">Aplazado:</label>
          <input type="number" placeholder="Nota" min="0" max="20" step="0.1" value="${curso.aplazado}" onchange="actualizarAplazado(${cIndex}, this.value)" style="width: 100%; padding: 4px; font-size: 0.82rem;">
        </div>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn-primary btn-anim" style="font-size: 0.8rem; flex:1;" onclick="agregarUnidad(${cIndex})">+ Unidad</button>
        ${estaAprobado ? `<button class="btn-celebrar btn-anim" style="width: 100%;" onclick="celebrarAprobado('${curso.nombre}')"><i class="fa-solid fa-champagne-glasses"></i> ¡Celebrar!</button>` : ''}
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function cambiarTipoCalculo(cIdx, val) { cursosData[cIdx].tipoCalculo = val; renderizarCursos(); }
function actualizarNombreCurso(cIdx, val) { cursosData[cIdx].nombre = val; }
function actualizarNombreUnidad(cIdx, uIdx, val) { cursosData[cIdx].unidades[uIdx].nombre = val; }
function actualizarPesoUnidad(cIdx, uIdx, val) { cursosData[cIdx].unidades[uIdx].peso = parseFloat(val) || 0; renderizarCursos(); }
function actualizarSustitutorio(cIdx, val) { cursosData[cIdx].sustitutorio = val; renderizarCursos(); }
function actualizarAplazado(cIdx, val) { cursosData[cIdx].aplazado = val; renderizarCursos(); }
function actualizarEvalNombre(cIdx, uIdx, eIdx, val) { cursosData[cIdx].unidades[uIdx].evaluaciones[eIdx].nombre = val; }
function actualizarEvalPeso(cIdx, uIdx, eIdx, val) { cursosData[cIdx].unidades[uIdx].evaluaciones[eIdx].peso = parseFloat(val) || 0; renderizarCursos(); }
function actualizarEvalNota(cIdx, uIdx, eIdx, val) { cursosData[cIdx].unidades[uIdx].evaluaciones[eIdx].nota = parseFloat(val) || 0; renderizarCursos(); }

function agregarUnidad(cIdx) {
  const n = cursosData[cIdx].unidades.length + 1;
  cursosData[cIdx].unidades.push({ nombre: `Unidad ${n}`, peso: 33.33, evaluaciones: [{ nombre: "Nueva Eval", peso: 100, nota: 0 }] });
  renderizarCursos();
}

function eliminarUnidad(cIdx, uIdx) { cursosData[cIdx].unidades.splice(uIdx, 1); renderizarCursos(); }
function agregarEvaluacion(cIdx, uIdx) { cursosData[cIdx].unidades[uIdx].evaluaciones.push({ nombre: "Nueva Eval", peso: 100, nota: 0 }); renderizarCursos(); }
function eliminarEvaluacion(cIdx, uIdx, eIdx) { cursosData[cIdx].unidades[uIdx].evaluaciones.splice(eIdx, 1); renderizarCursos(); }
function eliminarCurso(cIdx) { cursosData.splice(cIdx, 1); renderizarCursos(); }

function actualizarCantidadCursos() {
  const elCant = document.getElementById('cant-cursos');
  const cant = elCant ? parseInt(elCant.value) || 1 : 1;
  
  if (cant > cursosData.length) {
    for (let i = cursosData.length; i < cant; i++) {
      cursosData.push({
        id: Date.now() + i,
        nombre: `Curso ${i + 1}`,
        tipoCalculo: "promedio",
        sustitutorio: "",
        aplazado: "",
        unidades: [
          { nombre: "Unidad 1", peso: 33.33, evaluaciones: [{ nombre: "Examen 1", peso: 100, nota: 0 }] },
          { nombre: "Unidad 2", peso: 33.33, evaluaciones: [{ nombre: "Examen 2", peso: 100, nota: 0 }] },
          { nombre: "Unidad 3", peso: 33.34, evaluaciones: [{ nombre: "Examen 3", peso: 100, nota: 0 }] }
        ]
      });
    }
  } else if (cant < cursosData.length) {
    cursosData = cursosData.slice(0, cant);
  }
  renderizarCursos();
}

/* ==========================================
   CALENDARIO Y OTROS MÓDULOS
   ========================================== */
function inicializarCalendario24h() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl || typeof FullCalendar === 'undefined') return;

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'timeGridWeek',
    height: 'auto',
    contentHeight: 650,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: '01:00:00',
    slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short', hour12: true },
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,dayGridMonth' },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana' },
    events: []
  });
  calendarInstance.render();
}

function agregarClaseRecurrenteAlCalendario(titulo, diaSemanaTarget, horaInicio, horaFin, fechaInicioStr, fechaFinStr, aula, colorClase) {
  if (!calendarInstance) return;

  let actual = new Date(fechaInicioStr + "T00:00:00");
  const fechaFin = new Date(fechaFinStr + "T23:59:59");
  const targetDay = parseInt(diaSemanaTarget);

  while (actual <= fechaFin) {
    if (actual.getDay() === targetDay) {
      const year = actual.getFullYear();
      const month = String(actual.getMonth() + 1).padStart(2, '0');
      const day = String(actual.getDate()).padStart(2, '0');

      calendarInstance.addEvent({
        title: `${titulo} (${aula})`,
        start: `${year}-${month}-${day}T${horaInicio}:00`,
        end: `${year}-${month}-${day}T${horaFin}:00`,
        color: colorClase || '#1e40af'
      });
    }
    actual.setDate(actual.getDate() + 1);
  }
}

function configurarEventosFormularios() {
  document.getElementById('btn-darkmode')?.addEventListener('click', () => document.body.classList.toggle('dark-mode'));

  document.getElementById('form-horario')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const curso = document.getElementById('horario-curso').value;
    const dia = document.getElementById('horario-dia').value;
    const inicio = document.getElementById('horario-inicio').value;
    const fin = document.getElementById('horario-fin').value;
    const fInicio = document.getElementById('horario-fecha-inicio').value;
    const fFin = document.getElementById('horario-fecha-fin').value;
    const aula = document.getElementById('horario-aula').value || 'Sin aula';
    const colorEl = document.getElementById('horario-color');
    const color = colorEl ? colorEl.value : '';

    if (!color) return alert("Selecciona un color.");
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    horarioClases.push({ curso, dia: dias[dia], inicio, fin, aula, color });
    coloresUsados.add(color);
    
    renderHorario();
    renderColorPicker();
    agregarClaseRecurrenteAlCalendario(curso, dia, inicio, fin, fInicio, fFin, aula, color);
    if (calendarInstance) calendarInstance.gotoDate(fInicio);
    e.target.reset();
  });

  document.getElementById('form-tarea')?.addEventListener('submit', (e) => {
    e.preventDefault();
    tareas.push({ 
      id: Date.now(), 
      titulo: document.getElementById('tarea-titulo').value, 
      tipo: document.getElementById('tarea-tipo').value, 
      fecha: document.getElementById('tarea-fecha').value, 
      completada: false 
    });
    renderTareas();
    e.target.reset();
  });

  document.getElementById('form-finanzas')?.addEventListener('submit', (e) => {
    e.preventDefault();
    finanzas.push({ 
      id: Date.now(), 
      concepto: document.getElementById('fin-concepto').value, 
      monto: parseFloat(document.getElementById('fin-monto').value) || 0, 
      tipo: document.getElementById('fin-tipo').value 
    });
    renderFinanzas();
    e.target.reset();
  });

  document.getElementById('form-recurso')?.addEventListener('submit', (e) => {
    e.preventDefault();
    recursos.push({ 
      id: Date.now(), 
      curso: document.getElementById('rec-curso').value, 
      titulo: document.getElementById('rec-titulo').value, 
      url: document.getElementById('rec-url').value 
    });
    renderRecursos();
    e.target.reset();
  });
}

function renderTareas() {
  const ul = document.getElementById('lista-tareas');
  if (!ul) return;
  ul.innerHTML = tareas.map((t, i) => `
    <li>
      <strong>[${t.tipo}] ${t.titulo}</strong> - Límite: ${t.fecha}
      <button class="btn-delete-eval btn-anim" style="float:right;" onclick="eliminarTarea(${i})"><i class="fa-solid fa-xmark"></i></button>
    </li>
  `).join('');
}

function eliminarTarea(index) { tareas.splice(index, 1); renderTareas(); }

function renderFinanzas() {
  const ul = document.getElementById('lista-finanzas');
  const spanTotal = document.getElementById('total-balance');
  if (!ul) return;

  let total = 0;
  ul.innerHTML = finanzas.map((f, i) => {
    if (f.tipo === 'ahorro') total += f.monto;
    else total -= f.monto;

    return `
      <li>
        <strong>${f.concepto}</strong>: ${f.tipo === 'ahorro' ? '+' : '-'} S/ ${f.monto.toFixed(2)}
        <button class="btn-delete-eval btn-anim" style="float:right;" onclick="eliminarFinanza(${i})"><i class="fa-solid fa-xmark"></i></button>
      </li>
    `;
  }).join('');

  if (spanTotal) spanTotal.innerText = `S/ ${total.toFixed(2)}`;
}

function eliminarFinanza(index) { finanzas.splice(index, 1); renderFinanzas(); }

function renderRecursos() {
  const ul = document.getElementById('lista-recursos');
  if (!ul) return;
  ul.innerHTML = recursos.map((r, i) => `
    <li>
      <strong>${r.curso}:</strong> <a href="${r.url}" target="_blank" style="color: var(--primary-color);">${r.titulo}</a>
      <button class="btn-delete-eval btn-anim" style="float:right;" onclick="eliminarRecurso(${i})"><i class="fa-solid fa-xmark"></i></button>
    </li>
  `).join('');
}

function eliminarRecurso(index) { recursos.splice(index, 1); renderRecursos(); }

function celebrarAprobado(nombreCurso) {
  const overlay = document.getElementById('celebration-overlay');
  const gifImg = document.getElementById('celebration-gif');
  const lblCurso = document.getElementById('celebration-curso-nombre');

  if (overlay) {
    if (lblCurso) lblCurso.innerText = `¡Felicidades por aprobar ${nombreCurso}!`;
    if (gifImg) gifImg.src = "hinata-shoyo.gif";
    overlay.classList.add('activo');
  }

  if (audioAprobado) {
    audioAprobado.currentTime = 0;
    audioAprobado.play().catch(e => console.log(e));
  }

  if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
}

function cerrarCelebracion() {
  document.getElementById('celebration-overlay')?.classList.remove('activo');
  if (audioAprobado) audioAprobado.pause();
}

function renderTemasPlan() {
  const container = document.getElementById('lista-inputs-temas');
  if (!container) return;
  container.innerHTML = "";
  temasPlan.forEach((tema, index) => {
    const div = document.createElement('div');
    div.style.display = "flex"; div.style.alignItems = "center"; div.style.gap = "10px"; div.style.marginBottom = "8px";
    div.innerHTML = `
      <input type="checkbox" ${tema.completado ? 'checked' : ''} style="width: auto;" onchange="temasPlan[${index}].completado = !temasPlan[${index}].completado; actualizarGraficoProgreso();">
      <input type="text" value="${tema.nombre}" onchange="temasPlan[${index}].nombre = this.value; actualizarGraficoProgreso();" style="flex:1;">
      <button class="btn-delete-eval btn-anim" onclick="temasPlan.splice(${index},1); renderTemasPlan();"><i class="fa-solid fa-xmark"></i></button>
    `;
    container.appendChild(div);
  });
  actualizarGraficoProgreso();
}

function agregarTemaPlan() { 
  temasPlan.push({ id: Date.now(), nombre: `Nuevo Tema ${temasPlan.length + 1}`, completado: false }); 
  renderTemasPlan(); 
}

function inicializarGraficoProgreso() {
  const ctx = document.getElementById('chartProgreso');
  if (!ctx || typeof Chart === 'undefined') return;
  miGraficoProgreso = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Progreso de Estudio (%)', data: [], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
  });
  actualizarGraficoProgreso();
}

function actualizarGraficoProgreso() {
  if (!miGraficoProgreso) return;
  const total = temasPlan.length;
  let comp = 0, labels = ["Inicio"], data = [0];
  temasPlan.forEach((t) => {
    labels.push(t.nombre);
    if (t.completado) comp++;
    data.push(total > 0 ? (comp / total) * 100 : 0);
  });
  miGraficoProgreso.data.labels = labels;
  miGraficoProgreso.data.datasets[0].data = data;
  miGraficoProgreso.update();
}

function renderColorPicker() {
  const container = document.getElementById('color-picker');
  if (!container) return;
  container.innerHTML = "";
  listaColoresDisponibles.forEach((colorObj) => {
    const div = document.createElement('div');
    div.className = 'color-option btn-anim';
    div.style.backgroundColor = colorObj.hex;
    if (coloresUsados.has(colorObj.hex)) {
      div.style.opacity = "0.2";
    } else {
      div.onclick = () => {
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        const inputColor = document.getElementById('horario-color');
        if (inputColor) inputColor.value = colorObj.hex;
      };
    }
    container.appendChild(div);
  });
}

function renderHorario() {
  const ul = document.getElementById('lista-horario');
  if (!ul) return;
  ul.innerHTML = horarioClases.map((h) => `
    <li style="border-left: 5px solid ${h.color}; position: relative;">
      <strong>${h.curso}</strong> - ${h.dia} (${h.inicio} a ${h.fin})<br>
      <small>${h.aula}</small>
    </li>
  `).join('');
}