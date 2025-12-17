// State
let users = [];
let vehicles = [];
let trips = [];
let vehicleTypes = [];
let tripStatuses = [];

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.target;
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
    });
});

// Modals
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if (id === 'trip-modal') {
        document.getElementById('trip-form').reset();
        document.querySelector('#trip-form input[name="id"]').value = '';
        document.querySelector('#trip-modal h2').innerText = 'Nuevo Viaje';
    }
    if (id === 'user-modal') {
        document.getElementById('user-form').reset();
        document.querySelector('#user-form input[name="id"]').value = '';
        document.querySelector('#user-modal h2').innerText = 'Nuevo Usuario';
    }
    if (id === 'vehicle-modal') {
        document.getElementById('vehicle-form').reset();
        document.querySelector('#vehicle-form input[name="id"]').value = '';
        document.querySelector('#vehicle-modal h2').innerText = 'Nuevo Vehículo';
    }
}

function openFinalizeModal(id) {
    document.querySelector('#finalize-trip-form input[name="id"]').value = id;
    document.querySelector('#finalize-trip-form #carga-check').checked = false;
    document.querySelector('#finalize-trip-form textarea[name="observaciones"]').value = '';

    document.getElementById('finalize-trip-modal').style.display = 'flex';
}

function closeModal(id) {
    if (id) {
        document.getElementById(id).style.display = 'none';
    } else {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }
}

function openEditUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    document.querySelector('#user-form input[name="id"]').value = user.id;
    document.querySelector('#user-form input[name="name"]').value = user.name;
    document.querySelector('#user-form input[name="email"]').value = user.email;
    document.querySelector('#user-modal h2').innerText = 'Editar Usuario';
    openModal('user-modal');
}

function openEditVehicle(id) {
    const v = vehicles.find(v => v.id === id);
    if (!v) return;
    document.querySelector('#vehicle-form input[name="id"]').value = v.id;
    document.querySelector('#vehicle-form input[name="matricula"]').value = v.matricula;
    document.querySelector('#vehicle-form input[name="capacidad"]').value = v.capacidad;
    document.querySelector('#vehicle-modal h2').innerText = 'Editar Vehículo';
    openModal('vehicle-modal');
}

// Fetch Data
async function loadData() {
    try {
        const [usersRes, vehiclesRes, tripsRes, typesRes, statusRes] = await Promise.all([
            fetch('/users'),
            fetch('/vehiculos'),
            fetch('/viajes'),
            fetch('/tipos'),
            fetch('/estados')
        ]);

        users = await usersRes.json();
        vehicles = await vehiclesRes.json();
        trips = await tripsRes.json();
        vehicleTypes = await typesRes.json();
        tripStatuses = await statusRes.json();

        updateDashboard();
        renderUsers();
        renderVehicles();
        renderTrips();
        populateDropdowns();

    } catch (error) {
        console.error("Error loading data:", error);
        alert("Error connecting to backend: " + error.message + "\n\nMake sure the server is running!");
    }
}

function populateDropdowns() {
    const typeSelect = document.getElementById('vehicle-type-select');
    typeSelect.innerHTML = vehicleTypes.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');

    const driverSelect = document.getElementById('vehicle-driver-select');
    driverSelect.innerHTML = '<option value="">Sin asignar</option>' + users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');

    const tripVehicleSelect = document.getElementById('trip-vehicle-select');
    tripVehicleSelect.innerHTML = vehicles.map(v => `<option value="${v.id}">${v.matricula} (${v.tipo})</option>`).join('');

    const tripStatusSelect = document.getElementById('trip-status-select');
    tripStatusSelect.innerHTML = tripStatuses.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
}


// Render Functions
function updateDashboard() {
    document.getElementById('total-users').innerText = users.length;
    document.getElementById('total-vehicles').innerText = vehicles.length;
    document.getElementById('total-trips').innerText = trips.length;
}

function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <div class="avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">${user.name.charAt(0)}</div>
                    ${user.name}
                </div>
            </td>
            <td style="color: var(--text-muted);">${user.email}</td>
            <td>    
                <button class="icon-btn" onclick="openEditUser(${user.id})" style="width: 30px; height: 30px;"><i class="ri-edit-line"></i></button>
                <button class="icon-btn" onclick="deleteUser(${user.id})" style="width: 30px; height: 30px; color: var(--secondary);"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderVehicles() {
    const container = document.getElementById('vehicles-grid');
    container.innerHTML = vehicles.map(v => `
        <div class="vehicle-card" style="position: relative;">
            <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem;">
                <button class="icon-btn" onclick="openEditVehicle(${v.id})" style="width: 30px; height: 30px;"><i class="ri-edit-line"></i></button>
                <button class="icon-btn" onclick="deleteVehicle(${v.id})" style="width: 30px; height: 30px; color: var(--secondary);"><i class="ri-delete-bin-line"></i></button>
            </div>
            
            <h3>${v.matricula}</h3>
            <p style="color: var(--text-muted); margin-bottom: 1rem;">${v.tipo}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                <span><i class="ri-user-line"></i> ${v.conductor}</span>
                <span><i class="ri-group-line"></i> Cap: ${v.capacidad}</span>
            </div>
        </div>
    `).join('');
}

function renderTrips() {
    const container = document.getElementById('trips-list');
    container.innerHTML = trips.map(t => {
        const isfinalized = t.estado === 'Finalizado';

        // Status Badge with Icon
        let statusBadge = `<span style="color: var(--primary); font-weight: 600;">${t.estado}</span>`;
        if (isfinalized) {
            statusBadge += t.carga_correcta
                ? ` <i class="ri-checkbox-circle-line" style="color: #4ade80; margin-left: 0.5rem;" title="Carga Correcta"></i>`
                : ` <i class="ri-error-warning-line" style="color: #f87171; margin-left: 0.5rem;" title="Problema con carga"></i>`;
        }

        return `
        <div class="stat-card" style="margin-bottom: 1rem;">
            <div class="icon purple" style="background: rgba(255,255,255,0.05);">
                <i class="ri-map-pin-2-line"></i>
            </div>
            <div class="details" style="flex: 1;">
                <div style="display: flex; justify-content: space-between;">
                    <h3>${t.origen} <i class="ri-arrow-right-line" style="font-size: 1rem; color: var(--text-muted);"></i> ${t.destino}</h3>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${statusBadge}
                        ${!isfinalized ? `<button class="btn-primary" onclick="openFinalizeModal(${t.id})" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Llegó</button>` : ''}
                        <button class="icon-btn" onclick="deleteTrip(${t.id})" style="width: 30px; height: 30px; color: var(--secondary);"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Vehículo: ${t.vehiculo}</p>
                ${t.observaciones ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Obs: ${t.observaciones}</p>` : ''}
            </div>
        </div>
    `}).join('');
}

// CRUD Logic

// --- USERS ---
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const data = {
        name: formData.get('name'),
        email: formData.get('email')
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/users/${id}` : '/users';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal('user-modal');
            loadData();
        } else {
            alert("Error saving user");
        }
    } catch (err) { console.error(err); }
});

async function deleteUser(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`/users/${id}`, { method: 'DELETE' });
        loadData();
    } catch (err) { console.error(err); }
}

// --- VEHICLES ---
document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const data = {
        matricula: formData.get('matricula'),
        capacidad: formData.get('capacidad'),
        tipo_id: formData.get('tipo_id'),
        conductor_id: formData.get('conductor_id') || null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/vehiculos/${id}` : '/vehiculos';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal('vehicle-modal');
            loadData();
        } else {
            const err = await res.json();
            alert("Error: " + (err.error || "Unknown"));
        }
    } catch (err) { console.error(err); }
});

async function deleteVehicle(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`/vehiculos/${id}`, { method: 'DELETE' });
        loadData();
    } catch (err) { console.error(err); }
}

// --- TRIPS ---
document.getElementById('trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const data = {
        origen: formData.get('origen'),
        destino: formData.get('destino'),
        vehiculo_id: formData.get('vehiculo_id'),
        estado_id: formData.get('estado_id')
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/viajes/${id}` : '/viajes';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal('trip-modal');
            loadData();
        } else {
            alert("Error saving trip");
        }
    } catch (err) { console.error(err); }
});

document.getElementById('finalize-trip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const cargaCorrecta = document.getElementById('carga-check').checked;
    const obs = formData.get('observaciones');

    const finalStatus = tripStatuses.find(s => s.nombre === 'Finalizado');
    if (!finalStatus) {
        alert("Estado 'Finalizado' no encontrado en el sistema.");
        return;
    }

    try {
        await fetch(`/viajes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado_id: finalStatus.id,
                carga_correcta: cargaCorrecta,
                observaciones: obs
            })
        });
        closeModal('finalize-trip-modal');
        loadData();
    } catch (err) { console.error(err); }
});

async function deleteTrip(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`/viajes/${id}`, { method: 'DELETE' });
        loadData();
    } catch (err) { console.error(err); }
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadData);
