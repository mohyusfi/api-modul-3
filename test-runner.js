// test-runner.js
// Automated test runner untuk memverifikasi semua kondisi server.js

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== MEMULAI PENGUJIAN SEMUA KONDISI SERVER.JS ===\n');
  let passed = 0;
  let failed = 0;
  let createdId = null;

  async function assertCase(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // --- 1. KOLEKSI DESTINASI ---
  console.log('--- 1. Testing Endpoint Koleksi (/destinations) ---');

  await assertCase('1. GET /destinations - Sukses ambil semua (200)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Data bukan array atau kosong');
    if (!data[0].id || !data[0].fullname || !data[0].email || !data[0].address || !data[0].phone_number || !data[0].gender || !data[0].status) throw new Error('Struktur field tidak lengkap');
  });

  await assertCase('2. GET /destinations?gender=female - Filter gender ditemukan (200)', async () => {
    const res = await fetch(`${BASE_URL}/destinations?gender=female`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Bukan array');
    const invalid = data.find(d => d.gender !== 'female');
    if (invalid) throw new Error(`Ditemukan item dengan gender salah: ${invalid.gender}`);
  });

  await assertCase('3. GET /destinations?gender=other - Filter tidak ada hasil (200)', async () => {
    const res = await fetch(`${BASE_URL}/destinations?gender=other`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length !== 0) throw new Error('Harusnya menghasilkan array kosong []');
  });

  await assertCase('4. POST /destinations - Tambah user baru (201)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'Bambang Pamungkas',
        email: 'bambang.pamungkas@example.com',
        address: 'Jl. Mawar No. 15, Palu',
        phone_number: '081234567899',
        gender: 'male',
        status: 'active'
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const loc = res.headers.get('location');
    if (!loc || !loc.startsWith('/destinations/')) throw new Error(`Header Location salah: ${loc}`);
    const data = await res.json();
    if (!data.id || data.fullname !== 'Bambang Pamungkas') throw new Error('Data response salah');
    createdId = data.id;
  });

  await assertCase('5. POST /destinations - Field wajib hilang (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname: 'Hanya Nama' })
    });
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.error || !data.error.includes('Field wajib belum diisi')) throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('6. POST /destinations - Field bernilai spasi kosong (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: '   ',
        email: 'user@example.com',
        address: 'Palu',
        phone_number: '081234567899',
        gender: 'male',
        status: ''
      })
    });
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.error || !data.error.includes('Field wajib belum diisi')) throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('7. POST /destinations - Body JSON cacat/rusak (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "fullname": "Rusak", '
    });
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.error !== 'Body request bukan JSON yang valid') throw new Error(`Pesan error salah: ${data.error}`);
  });

  await assertCase('8. PUT /destinations - Method Not Allowed pada Koleksi (405)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, { method: 'PUT' });
    if (res.status !== 405) throw new Error(`Status ${res.status}`);
    const allow = res.headers.get('allow');
    if (!allow || !allow.includes('GET, POST')) throw new Error(`Header Allow salah: ${allow}`);
  });

  await assertCase('9. DELETE /destinations - Method Not Allowed pada Koleksi (405)', async () => {
    const res = await fetch(`${BASE_URL}/destinations`, { method: 'DELETE' });
    if (res.status !== 405) throw new Error(`Status ${res.status}`);
    const allow = res.headers.get('allow');
    if (!allow || !allow.includes('GET, POST')) throw new Error(`Header Allow salah: ${allow}`);
  });

  // --- 2. ITEM DESTINASI ---
  console.log('\n--- 2. Testing Endpoint Item (/destinations/:id) ---');

  await assertCase('10. GET /destinations/1 - Sukses ambil item (200)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/1`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.id !== 1) throw new Error(`ID tidak cocok: ${data.id}`);
    if (!data.fullname || !data.email) throw new Error('Field user tidak lengkap');
  });

  await assertCase('11. GET /destinations/99999 - ID tidak ditemukan (404)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/99999`);
    if (res.status !== 404) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.error || !data.error.includes('tidak ditemukan')) throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('12. GET /destinations/abc - ID bukan angka (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/abc`);
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.error !== 'id harus berupa bilangan bulat positif') throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('13. GET /destinations/0 - ID nol (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/0`);
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.error !== 'id harus berupa bilangan bulat positif') throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('14. PUT /destinations/1 - Sukses update item (200)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'Ahmad Dahlan (Updated)',
        email: 'ahmad.updated@example.com',
        address: 'Jl. Tadulako No. 12, Palu',
        phone_number: '081234567801',
        gender: 'male',
        status: 'inactive'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.fullname !== 'Ahmad Dahlan (Updated)') throw new Error(`Nama tidak terupdate: ${data.fullname}`);
  });

  await assertCase('15. PUT /destinations/99999 - Update ID tidak ada (404)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/99999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'User Fiktif',
        email: 'fiktif@example.com',
        address: 'Tidak Ada',
        phone_number: '08000000000',
        gender: 'male',
        status: 'inactive'
      })
    });
    if (res.status !== 404) throw new Error(`Status ${res.status}`);
  });

  await assertCase('16. PUT /destinations/1 - Update field hilang (400)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname: 'Hanya Nama' })
    });
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
  });

  await assertCase('17. POST /destinations/1 - Method Not Allowed pada Item (405)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/1`, { method: 'POST' });
    if (res.status !== 405) throw new Error(`Status ${res.status}`);
    const allow = res.headers.get('allow');
    if (!allow || !allow.includes('GET, PUT, DELETE')) throw new Error(`Header Allow salah: ${allow}`);
  });

  if (createdId) {
    await assertCase(`18. DELETE /destinations/${createdId} - Sukses hapus item (204)`, async () => {
      const res = await fetch(`${BASE_URL}/destinations/${createdId}`, { method: 'DELETE' });
      if (res.status !== 204) throw new Error(`Status ${res.status}`);
    });
  }

  await assertCase('19. DELETE /destinations/99999 - Hapus ID tidak ada (404)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/99999`, { method: 'DELETE' });
    if (res.status !== 404) throw new Error(`Status ${res.status}`);
  });

  // --- 3. ROUTER & GLOBAL ERROR ---
  console.log('\n--- 3. Testing Router & Global Error ---');

  await assertCase('20. GET /endpoint_salah - Endpoint tidak ditemukan (404)', async () => {
    const res = await fetch(`${BASE_URL}/endpoint_salah`);
    if (res.status !== 404) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.error !== 'Endpoint tidak ditemukan') throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  await assertCase('21. GET /destinations/1/subpath - Segmen lebih dari 2 (404)', async () => {
    const res = await fetch(`${BASE_URL}/destinations/1/subpath`);
    if (res.status !== 404) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.error !== 'Endpoint tidak ditemukan') throw new Error(`Pesan error tidak cocok: ${data.error}`);
  });

  console.log('\n======================================');
  console.log(`TOTAL PENGUJIAN: ${passed + failed}`);
  console.log(`BERHASIL (PASS): ${passed}`);
  console.log(`GAGAL    (FAIL): ${failed}`);
  console.log('======================================');
}

runTests().catch(console.error);
