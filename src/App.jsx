import './App.css'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Rotating from './components/Rotating'
import StrokeText from './components/StrokeText'
import TargetCursor from './components/TargetCursor'
import Folder from './components/Folder'
import ProfileCard from './components/ProfilCard'

// Data pendidikan. Urutan dari yang paling baru ke paling lama
// (item pertama otomatis jadi blok utama).
// - image : foto/logo sekolah di /public/education/
// - level : singkatan jenjang, tampil di garis waktu (S1, SMA, SMP, SD)
// - start / end : tahun mulai & lulus (dipakai untuk lebar blok garis waktu)
// - year  : teks periode (tampilan lama, masih dipakai sebagai cadangan)
// - meta  : (opsional) jurusan
// - badge : (opsional) penanda, mis. 'Pendidikan Terakhir'
// - desc  : (opsional) paragraf singkat tentang jenjang ini, tampil di panel yang terbuka.
// - fit   : (opsional) 'cover' kalau gambarnya foto (diisi penuh & boleh terpotong).
//           Kalau kosong = logo, ditampilkan utuh tanpa terpotong.
// - degree / photoWide / photoTall / competencies : khusus item pertama (blok utama).
//           Item lainnya tampil sebagai daftar ringkas (accordion) di bawahnya.
// - gpa   : (opsional) IPK, mis. '3.80 / 4.00'. Kalau diisi, tampil di blok utama.
const educationItems = [
  {
    image: '/education/kuliah.png',
    label: 'Universitas Sahid Surakarta',
    meta: 'Jurusan Informatika',
    level: 'S1',
    start: 2022,
    end: 2026,
    year: '2022 - 2026',
    badge: 'Pendidikan Terakhir',
    desc:
      'Menyelesaikan pendidikan Sarjana Informatika dengan fokus pembelajaran pada pengembangan aplikasi web, perancangan sistem informasi, pengelolaan basis data, dan analisis data. Selama masa studi, saya mengembangkan kemampuan teknis melalui kegiatan akademik, proyek pengembangan sistem, serta program pembelajaran di bidang Data Science.',
    gpa: '3.55 / 4.00',
    degree: 'Sarjana Informatika',
    // Dua foto di blok utama (mis. foto wisuda). Taruh file di /public/education/kuliah/
    // photoWide : foto lebar (landscape) di kiri atas
    // photoTall : foto besar di sisi kanan
    // Kalau file-nya belum ada, tampil kotak "Foto belum ditambahkan".
    photoWide: '/education/kuliah/wide.jpg',
    photoTall: '/education/kuliah/besar.jpg',
    // photoCampus : foto/logo universitas, tampil kecil & utuh (seperti SMA/SMP) di blok ini.
    // Hapus baris photoCampus kalau tidak dipakai.
    photoCampus: '/education/kuliah.png',
    // Daftar "Bidang Kompetensi" di blok utama. Tambah/hapus baris sesuka hati.
    competencies: [
      'Pengembangan Web (React, PHP, Laravel)',
      'Perancangan Sistem Informasi (UML, DFD)',
      'Basis Data (MySQL, MongoDB)',
      'Analisis & Visualisasi Data (Python, Tableau, Excel)',
      'Kerja Sama Tim & Koordinasi (HIMAIF)',
    ],
  },
  {
    image: '/education/sma.png',
    label: 'SMA Negeri 4 Karawang Barat',
    meta: 'Jurusan Ilmu Pengetahuan Alam',
    level: 'SMA',
    start: 2019,
    end: 2022,
    year: '2019 - 2022',
  },
  {
    image: '/education/smp.png',
    label: 'SMP Negeri 6 Karawang Barat',
    level: 'SMP',
    start: 2016,
    end: 2019,
    year: '2016 - 2019',
  },
  {
    image: '/education/sd.png',
    label: 'SDN Nagasari 2 Karawang Barat',
    level: 'SD',
    start: 2010,
    end: 2016,
    year: '2010 - 2016',
  },
];

// Turunan data untuk section Education
const eduRange = (item) => `${item.start}–${item.end}`;
const eduDuration = (item) => `${item.end - item.start} tahun`;
const hideBrokenImage = (e) => {
  e.currentTarget.style.display = 'none';
};

// Data sertifikat, dikelompokkan per kategori.
// Tinggal tambah/hapus objek di tiap array untuk update daftar sertifikat.
// - title   : nama sertifikat/kegiatan
// - issuer  : penyelenggara / penerbit
// - year    : tahun
// - image   : foto/scan sertifikat, mis. '/certificates/seminar-01.jpg'.
//             Tampil sebagai thumbnail di kartu; kalau diklik, terbuka pratinjau
//             gambar yang diperbesar.
// - link    : (opsional) link ke file asli (Drive, PDF di /public, dll).
//             Kalau diisi, muncul tautan "Buka file". Kalau tidak ada, hapus saja.
const certificatesData = {
  Organisasi: [
    {
      title: 'Anggota Himpunan Mahasiswa Informatika (HIMAIF) Universitas Sahid Surakarta',
      issuer: 'HIMAIF Universitas Sahid Surakarta',
      year: '2024',
      image: '/certificates/inf.jpeg',
    },
    {
      title: 'Panitia Seminar Startup Universitas Sahid Surakarta',
      issuer: 'HIMAIF Universitas Sahid Surakarta',
      year: '2023',
      image: '/certificates/seminar.jpg',
    },
    {
      title: 'Latihan Keterampilan Manajemen Mahasiswa (LKMM)',
      issuer: 'Universitas Sahid Surakarta',
      year: '2023',
      image: '/certificates/lkmm.jpg',
    },
  ],
  MSIB: [
    {
      title: 'Magang dan Studi Independen Bersertifikat (MSIB) - Data Science',
      issuer: 'Vinix7 - PT Inovasi Lentera Cipta Kreasi',
      year: '2025',
      image: '/certificates/vinix.jpg',
    },
  ],
  'Bahasa Inggris': [
    {
      title: 'Test of English as a Foreign Language (TOEFL) — Skor 460',
      issuer: 'Universitas Sahid Surakarta',
      year: '2026',
      image: '/certificates/toefl.jpg',
    },
  ],
};

// Data section Skills. Dikelompokkan jadi 4 kartu: Front-end, Back-end, Data & Analytics, Tools.
// - tag : label kecil di pojok kanan kartu
// - src : pakai CDN simple-icons (warna #f5f5f5) atau file lokal di /public
// Tinggal tambah/hapus objek di array items untuk mengubah daftarnya.
const skillGroups = [
  {
    id: 'frontend',
    title: 'Front-end',
    tag: 'Fokus utama',
    desc: 'Membangun tampilan web yang rapi dan responsif.',
    icon: (
      <>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    items: [
      { src: 'https://cdn.simpleicons.org/html5/f5f5f5', alt: 'HTML5', title: 'HTML5' },
      { src: '/tools/css.png', alt: 'CSS3', title: 'CSS3' },
      { src: 'https://cdn.simpleicons.org/javascript/f5f5f5', alt: 'JavaScript', title: 'JavaScript' },
      { src: 'https://cdn.simpleicons.org/react/f5f5f5', alt: 'React', title: 'React' },
      { src: 'https://cdn.simpleicons.org/vuedotjs/f5f5f5', alt: 'Vue.js', title: 'Vue.js' },
    ],
  },
  {
    id: 'backend',
    title: 'Back-end',
    tag: 'Sedang dieksplor',
    desc: 'Mengelola logika server dan database.',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="7" rx="2" />
        <rect x="3" y="14" width="18" height="7" rx="2" />
        <path d="M7 6.5h.01M7 17.5h.01" />
      </>
    ),
    items: [
      { src: 'https://cdn.simpleicons.org/php/f5f5f5', alt: 'PHP', title: 'PHP' },
      { src: 'https://cdn.simpleicons.org/laravel/f5f5f5', alt: 'Laravel', title: 'Laravel' },
      { src: 'https://cdn.simpleicons.org/mysql/f5f5f5', alt: 'MySQL', title: 'MySQL' },
      { src: 'https://cdn.simpleicons.org/mongodb/f5f5f5', alt: 'MongoDB', title: 'MongoDB' },
    ],
  },
  {
    id: 'data',
    title: 'Data & Analytics',
    tag: 'Pengalaman MSIB',
    desc: 'Mengolah data menjadi visual yang jelas.',
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 17v-5M13 17V8M18 17v-9" />
      </>
    ),
    items: [
      { src: '/tools/tableau.jpg', alt: 'Tableau', title: 'Tableau' },
      { src: '/tools/excel.png', alt: 'Microsoft Excel', title: 'Excel' },
      { src: 'https://cdn.simpleicons.org/python/f5f5f5', alt: 'Python', title: 'Python' },
      { src: 'https://cdn.simpleicons.org/scikitlearn/f5f5f5', alt: 'scikit-learn', title: 'scikit-learn' },
      { src: 'https://cdn.simpleicons.org/googlecolab/f5f5f5', alt: 'Google Colab', title: 'Google Colab' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    tag: 'Pendukung',
    desc: 'Alat bantu kerja sehari-hari.',
    icon: (
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z" />
    ),
    items: [
      { src: 'https://cdn.simpleicons.org/git/f5f5f5', alt: 'Git', title: 'Git' },
      { src: '/tools/visual.png', alt: 'Visual Studio Code', title: 'VS Code' },
      { src: 'https://cdn.simpleicons.org/claude/f5f5f5', alt: 'Claude', title: 'Claude' },
      { src: '/tools/chat.png', alt: 'ChatGPT', title: 'ChatGPT' },
      { src: 'https://cdn.simpleicons.org/googlegemini/f5f5f5', alt: 'Gemini', title: 'Gemini' },
      { src: 'https://cdn.simpleicons.org/postman/f5f5f5', alt: 'Postman', title: 'Postman' },
      { src: 'https://cdn.simpleicons.org/notion/f5f5f5', alt: 'Notion', title: 'Notion' },
      { src: 'https://cdn.simpleicons.org/figma/f5f5f5', alt: 'Figma', title: 'Figma' },
      { src: '/tools/canva.png', alt: 'Canva', title: 'Canva' },
      { src: '/tools/word.png', alt: 'Microsoft Word', title: 'Word' },
      { src: '/tools/ppt.png', alt: 'Microsoft PowerPoint', title: 'PowerPoint' },
    ],
  },
];

// Total tools di semua kartu Skills (dipakai untuk angka ringkasan)
const totalTools = skillGroups.reduce((n, g) => n + g.items.length, 0);

// Sorotan cahaya di kartu Skills mengikuti kursor (hanya terasa di perangkat mouse)
const handleSkillMove = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

// Data kartu Experience & Organization. Tinggal ubah/tambah objek di sini;
// tampilannya otomatis ikut.
const experienceItems = [
  {
    image: '/experience/msib.jpg',
    imageAlt: 'Kegiatan Program MSIB',
    // 'contain' = gambar ditampilkan utuh (cocok untuk logo). Kosong = memenuhi kotak.
    fit: 'contain',
    badge: 'MSIB',
    title: 'Magang & Studi Independen Bersertifikat-Data Science',
    meta: 'PT Inovasi Lentera Cipta Kreasi | 2025',
    summary:
      'Mengikuti program MSIB bidang Data Science selama 2025: data cleaning, EDA, analisis regresi, visualisasi data, pengenalan machine learning, serta pelatihan soft skill.',
    desc: [
      'Mengikuti program Magang dan Studi Independen Bersertifikat (MSIB) bidang Data Science di PT Inovasi Lentera Cipta Kreasi pada tahun 2025. Program ini berfokus pada pengolahan data, analisis statistik, visualisasi data, dan pengenalan machine learning melalui pembelajaran teori serta praktik berbasis studi kasus.',
      'Berikut kegiatan utama yang saya ikuti selama program. Hasil proyek akhir yang dikerjakan bersama tim dapat dilihat di bagian Projects.',
    ],
    // Tiap kegiatan: nama + penjelasan. Foto kegiatan (opsional): tambahkan
    // photos: ['/experience/msib/nama-foto.jpg'] kalau sudah ada fotonya.
    activitiesTitle: 'Kegiatan yang Diikuti',
    activities: [
      {
        title: 'Data Cleaning & Data Wrangling',
        text: 'Mempelajari tahapan menyiapkan data mentah agar siap dianalisis, mulai dari membersihkan data hingga merapikan strukturnya untuk menjaga kualitas data.',
      },
      {
        title: 'Exploratory Data Analysis (EDA)',
        text: 'Menelusuri karakteristik data dan hubungan antarvariabel menggunakan Python dengan Pandas, Seaborn, dan Matplotlib untuk eksplorasi serta visualisasi data.',
      },
      {
        title: 'Analisis Regresi',
        text: 'Mempelajari pola hubungan antardata dan cara melakukan prediksi melalui analisis regresi, dengan Microsoft Excel untuk pengolahan data.',
      },
      {
        title: 'Visualisasi Data & Data Storytelling',
        text: 'Menyajikan hasil analisis menjadi visual yang lebih mudah dipahami, menggunakan Tableau dan Looker Studio untuk membuat dashboard interaktif.',
      },
      {
        title: 'Pengenalan Machine Learning',
        text: 'Mempelajari dasar klasifikasi dan klasterisasi dengan metode machine learning menggunakan Orange.',
      },
      {
        title: 'Pelatihan Soft Skill (3 Seminar)',
        text: 'Mengikuti tiga seminar pengembangan diri: Dunia Kerja Digital: Tantangan dan Solusi dalam Keamanan Siber, Leadership for Young Minds, serta Dari Indonesia ke Dunia: Perjalanan Studi ke Amerika.',
      },
    ],
    tags: ['Data Science', 'Analisis Data', 'Visualisasi Data', 'Machine Learning Dasar', 'Soft Skill'],
  },
  {
    image: '/experience/exchange.jpg',
    imageAlt: 'Kegiatan Pertukaran Mahasiswa',
    badge: 'Exchange',
    title: 'Pertukaran Mahasiswa — STMIK AMIKOM Surakarta',
    meta: 'Program MBKM · 2023',
    summary:
      'Mengikuti Pertukaran Mahasiswa Merdeka (MBKM) di bidang Rekayasa Perangkat Lunak: konsep dasar RPL, Data Flow Diagram, serta diagram alir dokumen dan proses.',
    desc: [
      'Mengikuti program Pertukaran Mahasiswa Merdeka melalui program Merdeka Belajar Kampus Merdeka (MBKM) dengan kegiatan pembelajaran yang berfokus pada bidang Rekayasa Perangkat Lunak (RPL).',
      'Selama program berlangsung, saya mempelajari konsep dasar rekayasa perangkat lunak, Data Flow Diagram (DFD), serta diagram alir dokumen dan proses. Saya juga mengikuti diskusi kelompok untuk membahas dan menentukan tema tugas proyek sebagai bagian dari proses pembelajaran.',
      'Pengalaman ini membantu memperkuat pemahaman saya mengenai dasar-dasar pengembangan perangkat lunak, analisis proses, dan kolaborasi dalam lingkungan akademik.',
    ],
    pointsTitle: 'Poin Utama',
    points: [
      'Mempelajari konsep dasar Rekayasa Perangkat Lunak.',
      'Memahami penggunaan Data Flow Diagram (DFD).',
      'Mempelajari diagram alir dokumen dan proses.',
      'Berpartisipasi dalam diskusi kelompok dan pembahasan tema proyek.',
    ],
    tags: ['Pertukaran Mahasiswa MBKM', 'Rekayasa Perangkat Lunak', '2023'],
  },
  {
    image: '/experience/himaif.jpg',
    imageAlt: 'Kegiatan HIMAIF',
    badge: 'Organisasi',
    title: 'HIMAIF — Himpunan Mahasiswa Informatika',
    meta: 'Pengalaman Organisasi · Universitas Sahid Surakarta',
    summary:
      'Aktif di berbagai kegiatan HIMAIF: kepanitiaan seminar, malam keakraban (makrab), dan anjangsana bersama HMPTI Universitas Duta Bangsa.',
    desc: [
      'Aktif mengikuti berbagai kegiatan organisasi HIMAIF, termasuk kepanitiaan seminar, kegiatan malam keakraban (makrab), serta anjangsana bersama HMPTI Universitas Duta Bangsa.',
      'Melalui kegiatan tersebut, saya memperoleh pengalaman dalam bekerja sama dengan tim, berkoordinasi dalam pelaksanaan kegiatan, berkomunikasi dengan berbagai pihak, serta bertukar pikiran dengan mahasiswa dari universitas lain untuk memperluas wawasan dan membangun relasi.',
    ],
    // Tiap kegiatan punya nama, penjelasan, dan foto sendiri.
    // Ganti path foto dengan file asli di /public/experience/himaif/.
    // Foto yang file-nya belum ada otomatis disembunyikan (tidak tampil rusak).
    activitiesTitle: 'Kegiatan yang Diikuti',
    activities: [
      {
        title: 'Rapat Musyawarah Kerja HIMAIF 2023/2024',
        text: 'Mengikuti Rapat Musyawarah Kerja HIMAIF periode 2023/2024 yang membahas perencanaan program kerja setiap divisi, penyusunan jadwal kegiatan, serta evaluasi dan masukan untuk pelaksanaan program organisasi. Kegiatan ini memberikan pemahaman mengenai proses perencanaan, koordinasi, dan pengambilan keputusan dalam organisasi mahasiswa.',
        photos: [
          '/experience/rapat.jpg',
        ],
      },
       {
        title: 'Kepanitiaan Seminar Startup Universitas Sahid Surakarta',
        text: 'Berpartisipasi dalam kepanitiaan Seminar Startup Universitas Sahid Surakarta yang mengangkat tema “Meningkatkan Valuasi Diri Agar Mudah Terserap di Tengah Badai Layoff Startup”. Kegiatan ini membahas tantangan dunia kerja di bidang teknologi informasi bersama praktisi startup, sekaligus memberikan wawasan mengenai pengembangan diri dan kesiapan menghadapi perubahan industri digital.',
        photos: [
          '/experience/seminari.jpg',
        ],
      },
      {
        title: 'Kepanitiaan LDK Himaif 2024',
        text: 'Mengikuti kegiatan Latihan Dasar Kepemimpinan (LDK) HIMAIF 2024 sebagai bagian dari pengembangan diri dan kemampuan berorganisasi. Kegiatan ini menjadi kesempatan untuk mempelajari nilai-nilai kepemimpinan, kedisiplinan, komunikasi, dan kerja sama tim sebagai bekal dalam menjalankan tanggung jawab di organisasi mahasiswa.',
        photos: [
          '/experience/ldk.jpg',
        ],
      },
      {
        title: 'NAFTECH 2024 — Kepanitiaan HIMAIF',
        text: 'Berperan sebagai panitia dalam kegiatan NAFTECH 2024 yang melibatkan mahasiswa Informatika angkatan 2021, 2022, dan 2023. Kegiatan ini bertujuan mempererat hubungan antarangkatan melalui kebersamaan dan sesi berbagi pengalaman. Selain itu, kegiatan ini juga menghadirkan dosen untuk memberikan pembekalan ilmu dan wawasan sebagai bekal bagi mahasiswa dalam menjalani perkuliahan dan mengembangkan diri.',
        photos: [
          '/experience/nafthec.jpeg',
        ],
      },
      {
        title: 'Anjangsana HMPTI Universitas Duta Bangsa',
        text: 'Mengikuti kegiatan anjangsana bersama HMPTI Universitas Duta Bangsa sebagai ajang silaturahmi antarorganisasi mahasiswa di bidang teknologi informasi. Dalam kegiatan ini, saya berdiskusi, bertukar pikiran, dan berbagi perspektif dengan mahasiswa dari universitas lain. Kegiatan ini memperluas wawasan, mempererat hubungan antarmahasiswa, serta membangun relasi di luar lingkungan kampus.',
        photos: [
          '/experience/anjangsana.jpg',
        ],
      },
    ],
    tags: ['Kerja Sama Tim', 'Komunikasi', 'Koordinasi Kegiatan', 'Kolaborasi', 'Membangun Relasi'],
  },
];

// Data kartu Project. Tombol Details hanya muncul kalau item punya `detail`.
// - image : (opsional) foto/screenshot project di kartu, mis. '/projects/pos.jpg'.
//           Kalau kosong, tampil kotak placeholder "PROJECT 0X".
// - detail.images : (opsional) beberapa foto untuk jendela Details.
const projectItems = [
  {
    number: '01',
    title: 'Sistem Informasi Penjualan UMKM Kuliner',
    summary:
      'Website sistem informasi penjualan untuk UMKM kuliner yang dikembangkan sebagai Tugas Akhir S1. Pelanggan memesan sendiri lewat QR Code di meja, sementara admin dan owner mengelola menu, pesanan, dan laporan penjualan secara terpusat.',
    tech: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'AdminLTE'],
    image: '/projects/user.png',
    detail: {
      src: '/projects/user.png',
      // Foto ditaruh di /public/projects/. Rasio paling pas sekitar 1.85:1.
      screens: [
        {
          label: 'Pelanggan',
          role: 'Halaman Pelanggan',
          src: '/projects/user.png',
          caption:
            'Pelanggan memindai QR Code di meja, memilih menu per kategori (minuman, makanan, snack), mengisi nama dan nomor meja, lalu menerima struk digital dengan nomor antrean tanpa perlu login.',
        },
        {
          label: 'Admin',
          role: 'Halaman Admin',
          src: '/projects/admin.png',
          caption:
            'Admin memantau pesanan masuk, memperbarui statusnya (Pending, Diproses, Selesai), mengelola menu, pelanggan, dan ulasan, serta mencetak laporan penjualan.',
        },
        {
          label: 'Owner',
          role: 'Dashboard Owner',
          src: '/projects/owner.png',
          caption:
            'Owner melihat ringkasan omzet dan grafik penjualan, mengelola akun admin, menyetujui pengajuan ganti password, dan mengunduh laporan dalam format PDF.',
        },
      ],
      badge: 'Project 01',
      title: 'Sistem Informasi Penjualan UMKM Kuliner',
      meta: 'Website UMKM · Tugas Akhir S1 Informatika · 2026',
      desc: [
        'Project ini berangkat dari kebiasaan sebuah UMKM kuliner yang mencatat pesanan dan transaksi dengan nota kertas. Cara manual ini membuat antrean di kasir menumpuk, pencatatan pesanan rawan salah, dan rekap keuangan harus dihitung ulang dari tumpukan nota.',
        'Sistem yang dibangun memungkinkan pelanggan memesan sendiri dari meja lewat QR Code. Pesanan tersimpan otomatis di database, total belanja dihitung sistem, dan laporan penjualan harian, mingguan, serta bulanan tersusun tanpa rekap manual.',
        'Sistem memiliki tiga hak akses: Pelanggan (tanpa login), Admin/Kasir untuk operasional harian, dan Super Admin/Owner untuk pengawasan serta laporan. Dikembangkan dengan metode Waterfall dan dimodelkan dengan UML (use case, activity, sequence, dan class diagram).',
      ],
      pointsTitle: 'Fitur Utama',
      points: [
        'Pemesanan Mandiri via QR Code: pelanggan memesan dari meja tanpa antre di kasir.',
        'Katalog Menu Digital: filter kategori, keranjang, dan total harga otomatis.',
        'Struk Digital: berisi nomor antrean, rincian item, nomor meja, dan status bayar.',
        'Kelola Pesanan: admin memantau pesanan masuk dan memperbarui statusnya.',
        'Manajemen Menu (CRUD): tambah, ubah, hapus menu dan unggah foto produk.',
        'Kelola Pelanggan dan Ulasan: ringkasan data pelanggan serta moderasi ulasan.',
        'Laporan Penjualan: rekap harian, mingguan, bulanan, dan ekspor ke PDF.',
        'Hak Akses Berjenjang: pengajuan ganti password admin harus disetujui owner.',
      ],
      findingsTitle: 'Hasil Pengujian',
      findings: [
        'Black Box Testing: seluruh fitur pada sisi pelanggan, admin, dan super admin berjalan sesuai yang diharapkan.',
        'Evaluasi System Usability Scale (SUS) dari 34 responden menghasilkan skor rata-rata 53,53.',
        'Skor SUS tersebut menunjukkan tampilan sisi pelanggan masih perlu disederhanakan, terutama alur pemesanan dan halaman konfirmasi.',
        'Rekomendasi perbaikan: tata letak lebih ringkas, tombol lebih besar, langkah pemesanan lebih singkat, dan petunjuk penggunaan.',
      ],
      tagsTitle: 'Fokus Project',
      tags: ['Web Development', 'Sistem Informasi Penjualan', 'UMKM', 'Pengujian Usability'],
    },
  },
  {
    number: '02',
    title: 'POS Kasir Nasi Goreng Kongres',
    summary:
      'Sistem Point of Sale (POS) berbasis web yang dirancang untuk membantu proses transaksi penjualan dan pengelolaan operasional restoran Nasi Goreng Kongres. Menyediakan fitur kasir untuk mengelola pesanan dan pembayaran, serta halaman admin untuk mengelola menu, data transaksi, dan laporan penjualan secara terintegrasi.',
    tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
    image: '/projects/login.png',
    detail: {
      src: '/projects/login.png',
      // Tampilan aplikasi per peran. Foto ditaruh di /public/projects/.
      // Ukuran paling pas: tangkapan layar rasio sekitar 1.85:1 (mis. 1600x865).
      screens: [
        {
          label: 'Kasir',
          role: 'Halaman Kasir',
          src: '/projects/pos-kasir.png',
          caption:
            'Kasir memilih menu per kategori, mengatur jumlah dan catatan pesanan, lalu menerima pembayaran tunai, QRIS, atau m-Banking dan mencetak struk.',
        },
        {
          label: 'Admin',
          role: 'Halaman Admin',
          src: '/projects/pos-admin.png',
          caption:
            'Dashboard admin merangkum pendapatan, total order, penjualan 7 hari terakhir, pesanan terbaru, dan produk terlaris. Menu di samping mengatur daftar menu, laporan, kategori, dan akun.',
        },
      ],
      badge: 'Project 02',
      title: 'POS Kasir Nasi Goreng Kongres',
      meta: 'Sistem Kasir dan Pengelolaan Restoran Berbasis Web',
      desc: [
        'POS Kasir Nasi Goreng Kongres merupakan sistem informasi berbasis web yang dikembangkan untuk membantu proses transaksi penjualan dan pengelolaan operasional restoran secara lebih terstruktur. Sistem ini memiliki dua bagian utama, yaitu halaman Admin dan halaman Kasir, dengan fungsi yang disesuaikan berdasarkan kebutuhan masing-masing pengguna.',
        'Pada halaman Kasir, pengguna dapat memilih menu, mengelola pesanan, memproses pembayaran, dan mencetak struk transaksi. Sementara itu, halaman Admin digunakan untuk mengelola data menu, kategori, pengguna, transaksi, serta memantau laporan penjualan.',
        'Sistem ini dirancang untuk mempermudah pencatatan transaksi, membantu pengelolaan data restoran, dan menyediakan informasi penjualan yang dapat digunakan untuk memantau aktivitas bisnis.',
      ],
      pointsTitle: 'Fitur Utama',
      points: [
        'Sistem Kasir: Memilih menu, mengatur jumlah pesanan, dan memproses transaksi.',
        'Pengelolaan Pembayaran: Mendukung pilihan metode pembayaran yang tersedia pada sistem.',
        'Cetak Struk: Menampilkan rincian pesanan dan informasi transaksi.',
        'Manajemen Menu: Mengelola data menu dan kategori makanan.',
        'Dashboard Admin: Mengelola data operasional sesuai hak akses pengguna.',
        'Laporan Penjualan: Membantu pemantauan dan evaluasi transaksi penjualan.',
        'Hak Akses Pengguna: Memisahkan akses Admin dan Kasir sesuai peran masing-masing.',
      ],
      findingsTitle: 'Teknologi yang Digunakan',
      findings: [
        'PHP — Pengembangan sisi server.',
        'MySQL — Pengelolaan basis data.',
        'HTML dan CSS — Penyusunan struktur dan tampilan antarmuka.',
        'JavaScript — Interaksi dan fungsionalitas antarmuka.',
      ],
      tagsTitle: 'Fokus Project',
      tags: ['Web Development', 'Sistem Informasi Penjualan', 'Pengelolaan Basis Data'],
    },
  },
  {
    number: '03',
    title: 'Website Prototype Restoran Adun Satelit',
    summary:
      'Prototype website restoran untuk simulasi pemesanan makanan dan reservasi meja secara online. Pelanggan dapat melihat menu, memakai keranjang belanja, dan memilih tipe meja (Standard, VIP, Private Room, Outdoor). Frontend dibangun dengan Vue.js, backend dengan Node.js (Express.js), dan data disimpan di MongoDB.',
    tech: ['Vue.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
    image: '/projects/restoran-beranda.png',
    detail: {
      src: '/projects/restoran-beranda.png',
      // Foto ditaruh di /public/projects/.
      screens: [
        {
          label: 'Beranda',
          role: 'Halaman Beranda',
          src: '/projects/restoran-beranda.png',
          caption:
            'Beranda menampilkan keunggulan restoran, hidangan spesial lengkap dengan harga dan stok, serta tombol Tambah ke Keranjang.',
        },
        {
          label: 'Menu',
          role: 'Halaman Menu',
          src: '/projects/restoran-menu.png',
          caption:
            'Daftar menu lengkap dalam bentuk kartu berisi foto, deskripsi, harga, dan stok, dengan filter kategori makanan dan minuman.',
        },
        {
          label: 'Reservasi',
          role: 'Halaman Reservasi',
          src: '/projects/restoran-reservasi.png',
          caption:
            'Halaman reservasi menampilkan jam operasional, kapasitas meja, dan kontak, lalu mengarahkan pelanggan ke formulir reservasi.',
        },
        {
          label: 'Keranjang',
          role: 'Halaman Keranjang',
          src: '/projects/restoran-keranjang.png',
          caption:
            'Keranjang menampilkan item pesanan dan total harga, lalu pelanggan memilih metode pembayaran dan mengisi alamat pengiriman (simulasi).',
        },
        {
          label: 'Tentang Kami',
          role: 'Halaman Tentang Kami',
          src: '/projects/restoran-tentang.png',
          caption:
            'Memuat nilai restoran, profil tim inti, dan daftar penghargaan dalam tampilan yang bersih dan mudah dibaca.',
        },
      ],
      badge: 'Project 03',
      title: 'Website Prototype Restoran Adun Satelit',
      meta: 'Tugas Pemrograman Berbasis Platform · Prototype · 2025',
      desc: [
        'Website Prototype Restoran Adun Satelit adalah proyek mata kuliah Pemrograman Berbasis Platform yang mensimulasikan sistem pemesanan dan reservasi restoran berbasis web. Proyek ini menjawab masalah pada cara lama, yaitu pemesanan lewat telepon atau catatan buku yang rawan salah dengar, konfirmasi reservasi yang lambat, jadwal meja yang bisa bertabrakan, dan promosi lewat brosur yang jangkauannya terbatas.',
        'Pelanggan dapat melihat menu lengkap dengan foto dan harga, menambahkan hidangan ke keranjang, lalu menyelesaikan pesanan lewat simulasi pembayaran yang terhubung dengan WhatsApp. Reservasi meja dilakukan lewat formulir online yang memuat tanggal, jam, jumlah tamu, dan tipe meja (Standard, VIP, Private Room, Outdoor). Isi keranjang disimpan sementara di localStorage, jadi pelanggan bisa belanja tanpa harus login.',
        'Arsitekturnya client-server: frontend memakai Vue.js dan Tailwind CSS, sedangkan backend memakai Node.js (Express.js) dengan API RESTful yang terhubung ke MongoDB untuk menyimpan menu, pesanan, dan reservasi. Perancangan dimodelkan dengan use case diagram dan activity diagram. Ini adalah prototype yang dijalankan secara lokal dengan data simulasi, belum di-deploy dan belum dipakai di restoran nyata.',
      ],
      pointsTitle: 'Fitur Utama',
      points: [
        'Katalog Menu: kartu menu berisi foto, harga, stok, dan filter kategori.',
        'Keranjang Belanja: tambah, kurangi, hapus item, dengan total harga yang diperbarui langsung.',
        'Simulasi Pembayaran: pilihan metode bayar dan alamat pengiriman, plus konfirmasi lewat WhatsApp.',
        'Reservasi Meja: formulir dengan Flatpickr dan pilihan tipe meja, lalu modal konfirmasi.',
        'Promo dan Informasi Restoran: promo spesial, lokasi, galeri, nilai restoran, tim, dan penghargaan.',
        'Desain Responsif: navbar dengan menu hamburger untuk HP dan animasi AOS saat scroll.',
        'Backend REST API: data menu, pesanan, dan reservasi tersimpan di MongoDB lewat Express.js.',
      ],
      findingsTitle: 'Hasil Pengetesan',
      findings: [
        'Pengetesan manual memakai Google Chrome, Chrome DevTools, dan Postman untuk endpoint API.',
        'Navigasi, menu, keranjang, dan reservasi berjalan sesuai spesifikasi.',
        'Tampilan responsif di desktop, tablet, dan smartphone, serta konsisten di Chrome, Firefox, dan Edge.',
        'Koneksi frontend, backend, dan database MongoDB berjalan baik untuk menyimpan dan mengambil data.',
      ],
      tagsTitle: 'Fokus Project',
      tags: ['Web Development', 'Full-stack (MEVN)', 'Reservasi & Pemesanan Online', 'Prototype'],
    },
  },
  {
    number: '04',
    title: 'Klasifikasi Tumor Payudara dengan SVM',
    summary:
      'Studi kasus machine learning untuk mengklasifikasikan tumor jinak (benign) dan ganas (malignant) memakai Support Vector Machine pada Wisconsin Breast Cancer Dataset. Model mencapai akurasi 96,5%.',
    tech: ['Python', 'scikit-learn', 'Pandas', 'Google Colab'],
    image: '/projects/svm-pipeline.png',
    detail: {
      src: '/projects/svm-pipeline.png',
      screens: [
        {
          label: 'Pipeline',
          role: 'Pipeline Model',
          src: '/projects/svm-pipeline.png',
          caption:
            'Kode pipeline di Google Colab: seleksi 10 atribut, normalisasi dengan StandardScaler, pembagian data 80/20, pelatihan SVM kernel linear, lalu prediksi pada data uji.',
        },
        {
          label: 'Dataset',
          role: 'Persiapan Data',
          src: '/projects/svm-dataset.png',
          caption:
            'Dataset WBCD diunduh dari UCI Machine Learning Repository, dimuat ke Pandas, lalu dipisah menjadi fitur dan label (benign/malignant).',
        },
      ],
      badge: 'Project 04',
      title: 'Klasifikasi Tumor Payudara dengan SVM',
      meta: 'Machine Learning — Studi Kasus Pembelajaran (UAS)',
      desc: [
        'Project ini merupakan analisis klasifikasi tumor payudara menggunakan metode Support Vector Machine (SVM) dengan kernel linear. Data yang dipakai adalah Wisconsin Breast Cancer Dataset (WBCD) dari UCI Machine Learning Repository, berisi 569 data dengan label benign (jinak) dan malignant (ganas).',
        'Dari 30 atribut yang tersedia, dipilih 10 atribut rata-rata (mean) seperti radius, texture, perimeter, dan area. Data dibersihkan, label diubah menjadi numerik (0 dan 1), dinormalisasi dengan StandardScaler, lalu dibagi 80% untuk pelatihan dan 20% untuk pengujian.',
        'Project ini dibuat untuk keperluan pembelajaran dan bukan alat diagnosis medis.',
      ],
      pointsTitle: 'Tahapan Pengerjaan',
      points: [
        'Persiapan Data: Memuat dataset WBCD dan memeriksa distribusi kelas.',
        'Data Cleaning: Menghapus duplikat, menangani nilai kosong, dan encoding label.',
        'Data Selection: Memilih 10 atribut mean untuk proses klasifikasi.',
        'Transformasi: Normalisasi StandardScaler dan train-test split 80:20.',
        'Pelatihan Model: SVM kernel linear dengan hyperplane margin terbesar.',
        'Evaluasi: Akurasi, precision, recall, F1-score, dan confusion matrix.',
      ],
      findingsTitle: 'Hasil Evaluasi',
      findings: [
        'Akurasi: 96,5%',
        'Precision: 94%',
        'Recall: 94%',
        'F1-Score: 94%',
      ],
      tagsTitle: 'Fokus Project',
      tags: ['Machine Learning', 'Klasifikasi', 'Data Preprocessing', 'Evaluasi Model'],
    },
  },
  {
    number: '05',
    title: 'Analisis Daya Tampung Jalur Mandiri dan Biaya UKT di PTN Tahun 2025',
    summary:
      'Analisis daya tampung jalur mandiri dan variasi biaya UKT di PTN se-Indonesia tahun 2025, disajikan lewat dashboard interaktif Tableau. Dikerjakan secara tim.',
    tech: ['Tableau', 'Excel', 'Data Analysis'],
    image: '/projects/msib.png',
    detail: {
      image: '/projects/msib.png',
      imageAlt: 'Kegiatan Program MSIB',
      badge: 'Project 05',
      title: 'Analisis Daya Tampung Jalur Mandiri dan Biaya UKT di PTN Tahun 2025',
      meta: 'Project Data Science · Program MSIB · 2025',
      desc:
        'Project ini bertujuan menganalisis daya tampung jalur mandiri dan variasi biaya Uang Kuliah Tunggal (UKT) di berbagai Perguruan Tinggi Negeri (PTN) di Indonesia pada tahun 2025. Dikerjakan secara kolaboratif dalam tim sebagai bagian dari program MSIB bidang Data Science, mencakup perbandingan data daya tampung antaruniversitas dan program studi, serta variasi UKT berdasarkan jenjang pendidikan dan program studi. Hasil analisis disajikan melalui visualisasi data dan dashboard interaktif menggunakan Tableau agar pola dan informasi lebih jelas, terstruktur, dan mudah dipahami.',
      pointsTitle: 'Poin Utama Project',
      points: [
        'Analisis daya tampung jalur mandiri antarperguruan tinggi.',
        'Perbandingan kuota penerimaan mahasiswa antarprogram studi.',
        'Analisis variasi biaya UKT berdasarkan jenjang dan program studi.',
        'Visualisasi hasil analisis melalui dashboard Tableau.',
      ],
      findingsTitle: 'Temuan Analisis',
      findings: [
        'Daya tampung jalur mandiri tertinggi: Universitas Singaperbangsa Karawang (4.092), Universitas Negeri Surabaya (4.064), dan Universitas Negeri Jakarta (3.945).',
        'Terdapat variasi kuota antarprogram studi, termasuk Manajemen, Biologi, Ilmu Hukum, dan Bisnis Digital.',
        'Biaya UKT tertinggi yang tercatat dalam dataset project mencapai Rp25.000.000.',
      ],
      tags: ['Proyek Tim', 'Data Science & Analisis Data', 'Tableau', 'Dataset Excel'],
      link: {
        href: 'https://public.tableau.com/views/ANALISISDAYATAMPUNGJALURMANDIRIDIPTNBERDASARKANPROGRAMSTUDIDANBIAYAUKT/Sheet5?:language=en-US&:display_count=n&:origin=viz_share_link',
        label: 'Buka Dashboard Tableau',
      },
    },
  },
  {
    number: '06',
    title: 'Website Portofolio Pribadi',
    summary:
      'Website portofolio pribadi untuk menampilkan profil, pendidikan, pengalaman, skill, project, dan sertifikat dalam satu halaman. Dibangun dengan React, mendukung tema gelap dan terang, serta nyaman dibuka di laptop maupun HP.',
    tech: ['React', 'Vite', 'JavaScript', 'CSS'],
    image: '/projects/user1.png',
    detail: {
      badge: 'Project 06',
      title: 'Website Portofolio Pribadi',
      meta: 'Personal Website · Front-end Development · 2026',
      desc: [
        'Website ini saya buat sebagai tempat merangkum perjalanan akademik, pengalaman, kemampuan, dan project dalam satu halaman yang mudah dijelajahi oleh recruiter maupun siapa pun yang ingin mengenal saya.',
        'Seluruh konten (pendidikan, pengalaman, skill, project, dan sertifikat) disimpan sebagai data terpisah di dalam kode, sehingga untuk menambah atau mengubah isinya cukup mengedit data tersebut tanpa menyentuh tampilan. Halaman dibangun dengan React dan dirancang responsif untuk laptop, tablet, dan HP.',
      ],
      pointsTitle: 'Fitur Utama',
      points: [
        'Tema Gelap dan Terang: pilihan tema disimpan di browser, jadi diingat saat pengunjung kembali.',
        'Navigasi Cerdas: menu penanda section aktif mengikuti scroll, ada garis progress, dan menu hamburger di HP.',
        'Section Lengkap: About, Education, Experience, Skills, Projects, Certificates, dan Contact.',
        'Jendela Detail: pengalaman, project, dan sertifikat bisa dibuka dengan penjelasan serta foto yang bisa diperbesar.',
        'Formulir Kontak: pesan dikirim lewat Web3Forms, atau otomatis membuka aplikasi email bila belum dikonfigurasi.',
        'Animasi Ringan: efek muncul saat scroll, angka menghitung naik, dan judul beranimasi, serta mengikuti pengaturan "kurangi gerakan" di perangkat.',
      ],
      findingsTitle: 'Teknologi yang Digunakan',
      findings: [
        'React — komponen antarmuka dan pengelolaan state.',
        'Vite — lingkungan pengembangan dan proses build.',
        'JavaScript — interaksi seperti scroll-spy, pengiriman formulir, dan jendela detail.',
        'CSS — tata letak responsif, variabel tema gelap/terang, dan animasi.',
      ],
      tagsTitle: 'Fokus Project',
      tags: ['Web Development', 'Front-end', 'Desain Responsif', 'UI/UX'],
    },
  },
];

// Section Projects: FEATURED_COUNT project pertama tampil di grid bento
// (maksimal 4 kartu), sisanya masuk ke bagian "Project Lainnya".
const FEATURED_COUNT = 4;
const featuredProjects = projectItems.slice(0, FEATURED_COUNT);
const otherProjects = projectItems.slice(FEATURED_COUNT);

// ---------------------------------------------------------------------
// HoloSphere — bola hologram 3D untuk latar section Education.
// Murni HTML + CSS 3D (tanpa canvas/WebGL/library), jadi ringan.
// Animasi hanya jalan saat bola terlihat di layar & mati kalau "reduce motion".
// ---------------------------------------------------------------------
const HOLO_MERIDIANS = [0, 30, 60, 90, 120, 150]   // garis bujur (derajat)
const HOLO_LATITUDES = [-0.72, -0.4, 0, 0.4, 0.72] // garis lintang (tinggi relatif)

function HoloSphere() {
  const ref = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      setLive(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`edu-holo${live ? ' is-live' : ''}`} aria-hidden="true">
      <div ref={ref} className="holo-float">
        <div className="holo-sphere">
          <span className="holo-body" />
          <span className="holo-iris" />

          <div className="holo-tilt">
            <div className="holo-spin">
              {HOLO_MERIDIANS.map((a) => (
                <span key={`m${a}`} className="holo-m" style={{ '--a': `${a}deg` }} />
              ))}
              {HOLO_LATITUDES.map((h) => (
                <span
                  key={`l${h}`}
                  className={`holo-l${h === 0 ? ' holo-l--eq' : ''}`}
                  style={{ '--h': h, '--s': Math.sqrt(1 - h * h).toFixed(3) }}
                />
              ))}
            </div>
            <span className="holo-orbit" />
          </div>

          <span className="holo-scan" />
          <span className="holo-glint" />
        </div>

        {/* proyektor hologram di bawah bola */}
        <span className="holo-base" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// FloatingEnvelope — amplop 3D melayang untuk latar section Contact.
// Murni HTML + CSS 3D (tanpa canvas/WebGL/library), jadi ringan.
// Siklus: tutup → penutup terbuka → surat naik + kilau → surat turun → tutup.
// Animasi hanya jalan saat terlihat di layar & mati kalau "reduce motion".
// ---------------------------------------------------------------------
function FloatingEnvelope() {
  const ref = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      setLive(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`contact-env${live ? ' is-live' : ''}`} aria-hidden="true">
      <div ref={ref} className="env-float">
        <div className="env-stage">
          <div className="env-tilt">
            <span className="env-back" />
            <span className="env-letter" />
            <span className="env-pocket env-pocket--l" />
            <span className="env-pocket env-pocket--r" />
            <span className="env-pocket env-pocket--b" />
            <span className="env-flap">
              <i className="env-seal" />
            </span>
          </div>
        </div>

        <i className="env-spark env-spark--1" />
        <i className="env-spark env-spark--2" />
        <i className="env-spark env-spark--3" />

        <span className="env-shadow" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// FloatingLaptop — laptop 3D melayang untuk latar section Projects.
// Murni HTML + CSS 3D (tanpa canvas/WebGL/library), jadi ringan.
// Layar bergantian tiap ~4 detik: halaman web tersusun → dashboard data
// (batang naik + garis tergambar) → kode yang diketik, lalu mengulang.
// Animasi hanya jalan saat terlihat di layar & mati kalau "reduce motion"
// (layar diam menampilkan halaman web).
// ---------------------------------------------------------------------
const lapStyle = (s) => ({ '--st': `${s}s` })

const LAP_BARS = [40, 65, 50, 80, 60, 92, 75]
// [indent %, lebar %, warna] untuk tiap baris kode
const LAP_CODE = [
  [0, 38, 'a'],
  [10, 52, 'b'],
  [10, 30, 'c'],
  [20, 60, 'a'],
  [20, 44, 'd'],
  [10, 24, 'b'],
  [0, 18, 'a'],
]

function FloatingLaptop() {
  const ref = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window)) {
      setLive(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`proj-laptop${live ? ' is-live' : ''}`} aria-hidden="true">
      <div ref={ref} className="lap-float">
        <div className="lap-scale">
          <div className="lap-stage">
            <div className="lap-tilt">
              <span className="lap-shadow" />

              {/* Alas keyboard */}
              <span className="lap-deck">
                <i className="lap-keys" />
                <i className="lap-pad" />
              </span>

              {/* Layar */}
              <span className="lap-lid">
                <i className="lap-back" />
                <span className="lap-screen">
                  {/* Layar 1: halaman web tersusun */}
                  <div className="lap-scene lap-scene--1">
                    <i className="lap-el lap-nav" style={lapStyle(0.1)} />
                    <i className="lap-el lap-h1" style={lapStyle(0.4)} />
                    <i className="lap-el lap-h2" style={lapStyle(0.6)} />
                    <i className="lap-el lap-btn" style={lapStyle(0.85)} />
                    <div className="lap-cards">
                      {[0, 1, 2].map((i) => (
                        <i key={i} className="lap-el lap-card" style={lapStyle(1.1 + i * 0.25)} />
                      ))}
                    </div>
                  </div>

                  {/* Layar 2: dashboard data */}
                  <div className="lap-scene lap-scene--2">
                    <div className="lap-kpis">
                      {[0, 1, 2].map((i) => (
                        <i key={i} className="lap-el lap-kpi" style={lapStyle(0.1 + i * 0.2)} />
                      ))}
                    </div>
                    <div className="lap-bars">
                      {LAP_BARS.map((h, i) => (
                        <i
                          key={i}
                          className="lap-bar"
                          style={{ '--h': `${h}%`, '--st': `${0.5 + i * 0.12}s` }}
                        />
                      ))}
                    </div>
                    <svg className="lap-line" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        className="lap-draw"
                        pathLength="1"
                        d="M0 24 C15 20 22 10 36 14 S58 6 70 9 S90 2 100 4"
                        style={lapStyle(1.2)}
                      />
                    </svg>
                  </div>

                  {/* Layar 3: kode diketik */}
                  <div className="lap-scene lap-scene--3">
                    {LAP_CODE.map(([ind, w, c], i) => (
                      <i
                        key={i}
                        className={`lap-code lap-code--${c}`}
                        style={{ '--ind': `${ind}%`, '--w': `${w}%`, '--st': `${0.15 + i * 0.38}s` }}
                      />
                    ))}
                    <i className="lap-caret" />
                  </div>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Angka yang menghitung naik dari 0 saat masuk layar (sekali saja).
// Ringan: hanya mengubah teks satu elemen lewat ref (tanpa re-render per frame),
// dan langsung menampilkan angka akhir kalau perangkat memakai "kurangi gerakan".
function CountUp({ to, decimals = 0, duration = 1200 }) {
  const ref = useRef(null);
  const finalText = to.toFixed(decimals);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.textContent = finalText;
      return undefined;
    }

    let raf = 0;
    el.textContent = (0).toFixed(decimals);

    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // melambat di akhir
        el.textContent = (to * eased).toFixed(decimals);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, decimals, duration, finalText]);

  return (
    <span ref={ref} className="count-up" aria-label={finalText}>
      {finalText}
    </span>
  );
}

// Tombol pilih tema: Gelap / Terang.
function ThemeToggle({ theme, onChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Pilih tema tampilan">
      <button
        type="button"
        className={`theme-toggle-btn cursor-target ${theme === 'dark' ? 'is-active' : ''}`}
        aria-pressed={theme === 'dark'}
        aria-label="Mode gelap"
        onClick={() => onChange('dark')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
        <span>Gelap</span>
      </button>

      <button
        type="button"
        className={`theme-toggle-btn cursor-target ${theme === 'light' ? 'is-active' : ''}`}
        aria-pressed={theme === 'light'}
        aria-label="Mode terang"
        onClick={() => onChange('light')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <span>Terang</span>
      </button>
    </div>
  );
}

// Isi satu kartu Experience: gambar + ringkasan singkat + tombol Details
function ExperienceCardContent({ item, onOpen }) {
  return (
    <>
      <div className="experience-card-media">
        <img
          src={item.image}
          alt={item.imageAlt}
          className={item.fit === 'contain' ? 'is-contain' : undefined}
          loading="lazy"
        />
      </div>

      <div className="experience-card-body">
        <div className="experience-badge">{item.badge}</div>
        <h3>{item.title}</h3>
        <p className="experience-meta">{item.meta}</p>
        <p className="experience-desc experience-desc--wide">{item.summary}</p>

        <button
          type="button"
          className="experience-details-btn cursor-target"
          onClick={() => onOpen(item)}
        >
          Details <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
}

// Jendela detail: muncul di atas halaman saat tombol Details ditekan.
// Ditutup dengan tombol ×, klik area gelap, atau tombol Esc.
// Foto tambahan: isi `images: ['/experience/a.jpg', '/experience/b.jpg']`
// pada item di experienceItems (kalau tidak diisi, memakai `image` saja).
function ExperienceDetail({ item, onClose }) {
  const gallery =
    item.images && item.images.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];

  // Foto kegiatan yang sedang diperbesar (null = tidak ada)
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // Esc menutup pratinjau foto dulu, baru jendela detailnya
      if (preview) setPreview(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, preview]);

  return (
    <div className="experience-modal" onClick={onClose} role="presentation">
      <div
        className="experience-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="experience-modal-close"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>

        {gallery.length > 0 && (
          <div className="experience-modal-gallery">
            {gallery.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt={`${item.imageAlt} ${i + 1}`}
                className={i === 0 ? 'is-main' : ''}
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div
          className={`experience-modal-body ${gallery.length === 0 ? 'experience-modal-body--no-media' : ''}`}
        >
        <div className="experience-badge">{item.badge}</div>
        <h3>{item.title}</h3>
        <p className="experience-meta">{item.meta}</p>
        {(Array.isArray(item.desc) ? item.desc : item.desc ? [item.desc] : []).map((paragraph) => (
          <p key={paragraph} className="experience-desc experience-desc--wide experience-desc--para">
            {paragraph}
          </p>
        ))}

        {item.screens && item.screens.length > 0 && (
          <ScreenSwitcher screens={item.screens} onOpen={setPreview} />
        )}

        {item.activities && item.activities.length > 0 && (
          <div className="experience-block">
            <h4 className="experience-block-title">{item.activitiesTitle}</h4>
            <div className="experience-activities">
              {item.activities.map((activity) => (
                <article key={activity.title} className="experience-activity">
                  <div className="experience-activity-info">
                    <h5 className="experience-activity-title">{activity.title}</h5>
                    <p className="experience-activity-text">{activity.text}</p>
                  </div>
                  <ActivityPhotos
                    title={activity.title}
                    photos={activity.photos}
                    onOpen={setPreview}
                  />
                </article>
              ))}
            </div>
          </div>
        )}

        {item.points && (
          <div className="experience-block">
            <h4 className="experience-block-title">{item.pointsTitle}</h4>
            <ul className="experience-list">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {item.findings && (
          <div className="experience-block">
            <h4 className="experience-block-title">{item.findingsTitle}</h4>
            <ul className="experience-list">
              {item.findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </div>
        )}

        {item.tags && (
          <div className={item.tagsTitle ? 'experience-block' : undefined}>
            {item.tagsTitle && (
              <h4 className="experience-block-title">{item.tagsTitle}</h4>
            )}
            <div
              className="experience-tags"
              style={item.tagsTitle ? { marginTop: 0 } : undefined}
            >
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {item.link && (
          <a
            href={item.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="experience-link cursor-target"
          >
            {item.link.label} →
          </a>
        )}
        </div>
      </div>

      {/* Pratinjau foto kegiatan: lapisan di dalam jendela detail yang sama
          (bukan modal bertumpuk). Ketuk di mana saja untuk menutup. */}
      {preview && (
        <div
          className="experience-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={preview.alt}
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
          }}
        >
          <button
            type="button"
            className="experience-lightbox-close"
            aria-label="Tutup foto"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
            }}
          >
            ×
          </button>
          <img src={preview.src} alt={preview.alt} onClick={(e) => e.stopPropagation()} />
          <p className="experience-lightbox-caption">{preview.alt}</p>
        </div>
      )}
    </div>
  );
}

// Saat `npm run dev`, foto yang tidak ketemu tampil sebagai kotak putus-putus
// berisi alamat yang dicari (supaya mudah dicek). Di hasil build/hosting,
// foto yang tidak ketemu disembunyikan.
const IS_DEV = Boolean(import.meta.env && import.meta.env.DEV);

// Daftar kemungkinan alamat untuk satu foto, dicoba berurutan sampai ada
// yang berhasil dimuat:
//   1) persis seperti di data,
//   2) huruf besar/kecil ekstensi dibalik (.JPG <-> .jpg) — server hosting
//      membedakan huruf besar/kecil walau Windows/macOS tidak,
//   3) tanpa subfolder "himaif/" (kalau foto ditaruh langsung di /experience/).
function photoCandidates(src) {
  const bases = [src];
  if (src.includes('/himaif/')) bases.push(src.replace('/himaif/', '/'));

  const list = [];
  bases.forEach((base) => {
    list.push(base);
    const m = base.match(/^(.*)\.([A-Za-z0-9]+)$/);
    if (m) {
      const name = m[1];
      const ext = m[2];
      [ext.toLowerCase(), ext.toUpperCase()].forEach((e) => {
        if (e !== ext) list.push(`${name}.${e}`);
      });
    }
  });
  return [...new Set(list)];
}

// Satu foto kegiatan: coba alamat cadangan kalau yang pertama gagal.
function ActivityPhoto({ src, alt, label, onOpen, onMissing }) {
  const options = photoCandidates(src);
  const [attempt, setAttempt] = useState(0);
  const current = options[attempt] || src;

  const handleError = () => {
    if (attempt < options.length - 1) setAttempt(attempt + 1);
    else onMissing(src);
  };

  return (
    <button
      type="button"
      role="listitem"
      className="experience-photo"
      aria-label={label}
      onClick={() => onOpen({ src: current, alt })}
    >
      <img
        key={current}
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable="false"
        onError={handleError}
      />
    </button>
  );
}

// Pratinjau foto besar (ketuk di mana saja / tekan Esc untuk menutup).
function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="experience-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="experience-lightbox-close"
        aria-label="Tutup foto"
        onClick={onClose}
      >
        ×
      </button>
      <img src={photo.src} alt={photo.alt} onClick={(e) => e.stopPropagation()} />
      <p className="experience-lightbox-caption">{photo.alt}</p>
    </div>,
    document.body
  );
}

// Satu foto di blok utama Education. Kalau file-nya belum ada, tampil kotak
// "Foto belum ditambahkan" (di mode dev juga menampilkan alamat yang dicari).
function EduShot({ src, alt, onOpen }) {
  const [ok, setOk] = useState(false);
  // Rasio asli foto: kotak mengikuti rasio ini, jadi foto penuh tanpa terpotong
  const [ratio, setRatio] = useState(null);

  return (
    <button
      type="button"
      className={`edu-shot${ok ? ' is-ready' : ''}`}
      style={ratio ? { aspectRatio: String(ratio) } : undefined}
      aria-label={`Perbesar foto — ${alt}`}
      disabled={!ok}
      onClick={() => onOpen({ src, alt })}
    >
      <span className="edu-shot__missing">
        Foto belum ditambahkan
        {IS_DEV && src && <code>{src}</code>}
      </span>
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable="false"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            // Dibatasi supaya foto yang sangat panjang/lebar tidak merusak tata letak
            if (w && h) setRatio(Math.min(2.4, Math.max(0.6, w / h)));
            setOk(true);
          }}
          onError={(e) => {
            setOk(false);
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </button>
  );
}

// IPK: '3.55 / 4.00' -> angka 3.55 menghitung naik, ' / 4.00' tetap
function GpaValue({ gpa }) {
  const [score, ...rest] = gpa.split(' ');
  const num = parseFloat(score);
  if (Number.isNaN(num)) return gpa;
  const decimals = (score.split('.')[1] || '').length;
  return (
    <>
      <CountUp to={num} decimals={decimals} duration={1400} />
      {rest.length > 0 ? ` ${rest.join(' ')}` : ''}
    </>
  );
}

// Deretan foto satu kegiatan: geser horizontal (scroll-snap native).
// Foto yang benar-benar tidak ada disembunyikan (di mode dev: ditandai),
// dan kalau semuanya gagal, deretannya ikut hilang — tidak ada kotak rusak.
function ActivityPhotos({ title, photos, onOpen }) {
  const [missing, setMissing] = useState(() => new Set());

  const list = photos || [];
  const shown = IS_DEV ? list : list.filter((src) => !missing.has(src));
  if (shown.length === 0) return null;

  const markMissing = (src) =>
    setMissing((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });

  return (
    <div className="experience-photo-strip" role="list" aria-label={`Foto ${title}`}>
      {shown.map((src, i) =>
        missing.has(src) ? (
          <div
            key={src}
            role="listitem"
            className="experience-photo experience-photo--missing"
          >
            <span>Foto tidak ditemukan</span>
            <code>{src}</code>
          </div>
        ) : (
          <ActivityPhoto
            key={src}
            src={src}
            alt={`${title} — foto ${i + 1}`}
            label={`Perbesar foto ${i + 1} — ${title}`}
            onOpen={onOpen}
            onMissing={markMissing}
          />
        )
      )}
    </div>
  );
}

// Tampilan aplikasi per peran (mis. Kasir / Admin) di jendela Details.
// Tab menggeser panel dengan arah sesuai urutan; klik foto untuk memperbesar
// lewat pratinjau yang sama dengan foto kegiatan. Panah kiri/kanan juga bisa.
function ScreenSwitcher({ screens, onOpen }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  const go = (i) => {
    const next = (i + screens.length) % screens.length;
    setActive(next);
    if (tabRefs.current[next]) tabRefs.current[next].focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  const current = screens[active];

  return (
    <div className="screens" style={{ '--n': screens.length, '--i': active }}>
      <div
        className="screens-tabs"
        role="tablist"
        aria-label="Pilih tampilan aplikasi"
        onKeyDown={handleKeyDown}
      >
        <span className="screens-tabs-thumb" aria-hidden="true" />
        {screens.map((s, i) => (
          <button
            key={s.label}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`screen-tab-${i}`}
            aria-selected={i === active}
            aria-controls="screen-stage"
            tabIndex={i === active ? 0 : -1}
            className={`screens-tab ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="screens-caption" key={active}>
        {current.caption}
      </p>

      <div className="screens-window">
        <div className="screens-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="screens-bar-title">{current.role}</span>
        </div>

        <div
          id="screen-stage"
          className="screens-stage"
          role="tabpanel"
          aria-labelledby={`screen-tab-${active}`}
        >
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={`screens-pane ${
                i === active ? 'is-active' : i < active ? 'is-before' : 'is-after'
              }`}
              aria-hidden={i !== active}
              tabIndex={i === active ? 0 : -1}
              aria-label={`Perbesar foto — ${s.role}`}
              onClick={() => onOpen({ src: s.src, alt: `${s.role} — ${s.caption}` })}
            >
              <span className="screens-missing">
                Foto belum ditambahkan
                {IS_DEV && <code>{s.src}</code>}
              </span>
              <img
                src={s.src}
                alt={s.role}
                loading="lazy"
                decoding="async"
                draggable="false"
                onError={hideBrokenImage}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// StrokeText butuh fontSize dalam angka px (SVG), bukan string CSS clamp().
// Hook ini meniru perilaku clamp(48px, 8vw, 100px) supaya ukurannya tetap
// menyesuaikan lebar layar seperti judul aslinya.
function useHeroStrokeFontSize() {
  const [fontSize, setFontSize] = useState(96);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w <= 640) {
        // HP: nama harus muat satu baris di lebar layar
        setFontSize(Math.max(28, Math.min(56, (w - 40) / 9.6)));
      } else {
        setFontSize(Math.min(100, Math.max(48, w * 0.08)));
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return fontSize;
}

// Ganti USERNAME dengan username asli sebelum dikirim ke HRD.
// Access key Web3Forms (gratis, tanpa backend). Daftar di https://web3forms.com,
// lalu simpan di file .env sebagai VITE_WEB3FORMS_KEY=xxxx. Kalau kosong, form
// otomatis membuka aplikasi email (mailto).
const WEB3FORMS_KEY = (import.meta.env && import.meta.env.VITE_WEB3FORMS_KEY) || '';

const CONTACT = {
  name: "Muhamad A'biddin",
  role: 'Informatics Graduate · Web Developer',
  email: 'muhabiddin80354@gmail.com',
  phone: '+62 856-9732-1736',
  whatsapp: 'https://wa.me/6285697321736',
  location: 'Karawang, Indonesia',
}

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Abidin1203' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhamad-abidin-845098315' },
  { label: 'Instagram', href: 'https://instagram.com/abdnn26' },
]

// Gambar sertifikat mini untuk kertas di dalam folder (menggantikan emoji).
// Tiga variasi supaya tiga kertas tidak terlihat kembar.
function CertFolderPaper({ variant = 0, title }) {
  const [a, b, c] = [
    [34, 40, 28],
    [40, 30, 36],
    [30, 40, 34],
  ][variant % 3];

  return (
    <span className="cert-folder-doc" title={title} aria-hidden="true">
      <svg viewBox="0 0 60 78" preserveAspectRatio="xMidYMid meet">
        <rect x="4" y="4" width="52" height="70" rx="2" fill="none" stroke="#cfcadb" strokeWidth="1.2" />
        <rect x="9" y="9" width="42" height="60" rx="1" fill="none" stroke="#e1deea" strokeWidth="0.8" />
        <rect x={30 - a / 2} y="17" width={a} height="2.6" rx="1.3" fill="#8b5cf6" opacity="0.75" />
        <rect x={30 - b / 2} y="27" width={b} height="1.7" rx="0.85" fill="#d9d5e4" />
        <rect x={30 - c / 2} y="33" width={c} height="1.7" rx="0.85" fill="#d9d5e4" />
        <rect x={30 - (b - 8) / 2} y="39" width={b - 8} height="1.7" rx="0.85" fill="#d9d5e4" />
        <path d="M13 61h16" stroke="#cfcadb" strokeWidth="1" strokeLinecap="round" />
        <circle cx="43" cy="58" r="6" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.7" />
        <circle cx="43" cy="58" r="2.8" fill="#8b5cf6" opacity="0.25" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------
// Dinding galeri sertifikat: bingkai di dinding, klik untuk tampilan besar.
// Panah kiri/kanan, Esc, dan geser jari (HP) bekerja di tampilan besar.
// ---------------------------------------------------------------------
const padNum = (n) => String(n).padStart(2, '0');

function CertLightbox({ items, index, onClose, onChange }) {
  const item = items[index];
  const total = items.length;
  const closeRef = useRef(null);
  const touchX = useRef(null);

  const go = (step) => onChange((index + step + total) % total);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && total > 1) go(1);
      else if (e.key === 'ArrowLeft' && total > 1) go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Muat foto tetangga lebih dulu supaya pindah sertifikat terasa instan
  useEffect(() => {
    if (total < 2) return;
    [1, -1].forEach((step) => {
      const img = new Image();
      img.src = items[(index + step + total) % total].src;
    });
  }, [index, items, total]);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null || total < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <div
      className="cw-lb"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        className="cw-lb-close"
        aria-label="Tutup"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <figure
        className="cw-lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="cw-lb-frame">
          <div className="cw-lb-mat">
            <img key={item.src} className="cw-lb-img" src={item.src} alt={`Sertifikat ${item.title}`} />
          </div>
        </div>

        <figcaption className="cw-lb-cap">
          <div className="cw-lb-cap-main">
            <span className="cw-lb-eyebrow">
              {item.category} · {item.year}
            </span>
            <strong>{item.title}</strong>
            <span className="cw-lb-issuer">{item.issuer}</span>
          </div>
          <span className="cw-lb-count">
            {padNum(index + 1)} / {padNum(total)}
          </span>
        </figcaption>
      </figure>

      {total > 1 && (
        <>
          <button
            type="button"
            className="cw-lb-nav cw-lb-nav--prev"
            aria-label="Sertifikat sebelumnya"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="cw-lb-nav cw-lb-nav--next"
            aria-label="Sertifikat berikutnya"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

function CertWall({ certs }) {
  const [broken, setBroken] = useState(() => new Set());
  const [open, setOpen] = useState(null);
  const lastTrigger = useRef(null);

  // Terbaru di atas. Sertifikat tanpa foto atau fotonya gagal dimuat dilewati.
  const items = certs
    .map((c) => ({
      title: c.title,
      issuer: c.issuer,
      year: c.year,
      category: c.category,
      src: (c.images && c.images[0]) || c.image || null,
    }))
    .filter((c) => c.src && !broken.has(c.src))
    .sort((a, b) => Number(b.year) - Number(a.year));

  const markBroken = (src) =>
    setBroken((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });

  const close = () => {
    setOpen(null);
    if (lastTrigger.current) lastTrigger.current.focus();
  };

  return (
    <div className="cw">
      <div className="cw-head">
        <span className="cw-head-label">Arsip sertifikat</span>
        <span className="cw-head-count">{padNum(items.length)} dokumen</span>
      </div>

      <ul className="cw-wall">
        {items.map((c, i) => (
          <li key={`${c.title}-${c.year}`} className="cw-item" style={{ '--i': i }}>
            <button
              type="button"
              className="cw-frame cursor-target"
              aria-label={`Perbesar sertifikat: ${c.title}`}
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
            >
              <span className="cw-mat">
                <img
                  src={c.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  onError={() => markBroken(c.src)}
                />
              </span>
            </button>

            <p className="cw-plaque">
              <span className="cw-year">{c.year}</span>
              <span className="cw-title">{c.title}</span>
              <span className="cw-issuer">{c.issuer}</span>
            </p>
          </li>
        ))}
      </ul>

      {open !== null && items[open] && (
        <CertLightbox items={items} index={open} onClose={close} onChange={setOpen} />
      )}
    </div>
  );
}

function Footer({ theme }) {
  // Link yang masih berisi USERNAME disembunyikan otomatis; begitu kamu
  // mengisi username asli di SOCIALS, tautannya langsung muncul sendiri.
  const socials = SOCIALS.filter((s) => !s.href.includes('USERNAME'))

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#education', label: 'Education' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#certifications', label: 'Certificates' },
  ]

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <a href="#home" className="site-footer__logo" aria-label={`${CONTACT.name} — kembali ke atas`}>
            <img
              src={theme === 'light' ? '/logo/logo-mark-dark.svg' : '/logo/logo-mark.svg'}
              alt=""
              height="34"
              decoding="async"
              onError={hideBrokenImage}
            />
            <span className="site-footer__name">{CONTACT.name}</span>
          </a>
          <p className="site-footer__role">{CONTACT.role}</p>
          <p className="site-footer__status">
            <span className="site-footer__dot" aria-hidden="true" />
            Tersedia untuk pekerjaan &amp; magang
          </p>
        </div>

        <nav className="site-footer__col site-footer__nav" aria-label="Navigasi footer">
          <h4 className="site-footer__heading">Navigasi</h4>
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <h4 className="site-footer__heading">Kontak</h4>

          <div className="footer-icons">
            {/* Email */}
            <a
              href={`mailto:${CONTACT.email}`}
              className="footer-icon cursor-target"
              aria-label="Email"
              title="Email"
            >
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={CONTACT.whatsapp} target="_blank"
              rel="noopener noreferrer"
              className="footer-icon cursor-target"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Abidin1203" target="_blank"
              rel="noopener noreferrer"
              className="footer-icon cursor-target"
              aria-label="GitHub"
              title="GitHub"
            >
<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.94 3.2 9.13 7.65 10.61.56.1.76-.24.76-.54 0-.27-.01-1.16-.02-2.11-3.11.68-3.77-1.32-3.77-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.01-.7.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.22 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.24-5.12 5.52.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.77.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/muhamad-abidin-845098315" target="_blank"
              rel="noopener noreferrer"
              className="footer-icon cursor-target"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/abdnn26" target="_blank"
              rel="noopener noreferrer"
              className="footer-icon cursor-target"
              aria-label="Instagram"
              title="Instagram"
            >
<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>

          <p className="footer-location">{CONTACT.location}</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>
          © {new Date().getFullYear()} {CONTACT.name}.
        </p>
        <a href="#home">Kembali ke atas ↑</a>
      </div>
    </footer>
  )
}

function App() {
  const heroFontSize = useHeroStrokeFontSize();
  // Efek cursor hanya untuk perangkat dengan mouse (bukan layar sentuh)
  const [hasFinePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
  // Tema tampilan: 'dark' (default) atau 'light'. Pilihan disimpan di
  // localStorage supaya diingat saat pengunjung kembali.
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* localStorage tidak tersedia, pakai default */
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* abaikan */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f5ff' : '#0b0b0f');
  }, [theme]);

  const changeTheme = (next) => {
    if (next === theme) return;
    // Transisi warna halus hanya sesaat saat tombol ditekan
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 450);
    setTheme(next);
  };

  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCertFolderOpen, setIsCertFolderOpen] = useState(false);
  const certCategories = Object.keys(certificatesData);
  const totalCerts = certCategories.reduce(
    (total, category) => total + certificatesData[category].length,
    0
  );
  // Daftar datar semua sertifikat (kategori jadi label kecil saja)
  const allCerts = certCategories.flatMap((category) =>
    certificatesData[category].map((cert) => ({ ...cert, category }))
  );
  const [selectedExperience, setSelectedExperience] = useState(null);
  // Jenjang yang sedang terbuka di section Education (awal: yang terbaru)
  const [openEdu, setOpenEdu] = useState(null);
  // Foto yang sedang diperbesar di blok utama Education (null = tidak ada)
  const [eduPreview, setEduPreview] = useState(null);
  // Kartu project yang sedang disorot di grid bento (awal: yang pertama)
  const [activeProject, setActiveProject] = useState(0);
  // Di layar sentuh: ketukan pertama hanya menyorot kartu, ketukan kedua membuka detail.
  // Nilai: null (bukan sentuhan) | true (kartu sudah aktif saat disentuh) | false (belum).
  const projectTouchWasActive = useRef(null);
  // Daftar "Project Lainnya": tertutup dulu, terbuka saat tombolnya diklik
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Ref navbar: pill penanda menu aktif + progress bar scroll. Diubah lewat
  // style langsung (bukan state) supaya tidak re-render tiap scroll.
  const navListRef = useRef(null);
  const navPillRef = useRef(null);
  const navProgressRef = useRef(null);

  // State form contact. Sengaja dipisah dari komponen lain supaya nanti
  // gampang di-hook ke backend (fetch/axios ke endpoint sendiri).
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState('idle'); // idle | sending | sent | opened | error
  const [contactError, setContactError] = useState('');
  const contactTimer = useRef(0);

  // Kembalikan status ke "idle" setelah beberapa detik; timer lama dibatalkan
  // supaya pesan status tidak hilang terlalu cepat atau saling tumpuk.
  const resetContactStatus = (ms) => {
    window.clearTimeout(contactTimer.current);
    contactTimer.current = window.setTimeout(() => {
      setContactStatus('idle');
      setContactError('');
    }, ms);
  };

  useEffect(() => () => window.clearTimeout(contactTimer.current), []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const showContactError = (message) => {
    setContactError(message);
    setContactStatus('error');
    resetContactStatus(7000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (contactStatus === 'sending') return;

    // Honeypot anti-bot: kolom tersembunyi ini hanya diisi oleh bot.
    if (e.target.elements.botcheck && e.target.elements.botcheck.checked) return;

    // Rapikan isi form (spasi di awal/akhir dibuang) dan cek ulang.
    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message) {
      showContactError('Please fill in your name, email, and message.');
      return;
    }
    if (message.length < 10) {
      showContactError('Your message is a bit short. Please write at least 10 characters.');
      return;
    }

    // Tanpa access key: buka aplikasi email bawaan dengan pesan yang sudah terisi.
    if (!WEB3FORMS_KEY) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
      setContactStatus('opened');
      resetContactStatus(8000);
      return;
    }

    // Dengan access key: kirim lewat Web3Forms, langsung masuk ke email kamu.
    // Dibatasi 15 detik supaya tombol tidak "menggantung" kalau koneksi buruk.
    setContactStatus('sending');
    setContactError('');
    const controller = new AbortController();
    const abortTimer = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New portfolio message from ${name}`,
          from_name: 'Portfolio Contact Form',
          name,
          email,
          message,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        /* balasan bukan JSON: ditangani di bawah */
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
      resetContactStatus(8000);
    } catch (err) {
      console.error('Contact form error:', err);
      showContactError(
        err.name === 'AbortError'
          ? 'The request took too long. Please check your connection and try again.'
          : `Your message could not be sent. Please try again, or email me directly at ${CONTACT.email}.`
      );
    } finally {
      window.clearTimeout(abortTimer);
    }
  };

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#education', label: 'Education' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#certifications', label: 'Certificates' },
    { href: '#contact', label: 'Contact' },
  ];

  // Kunci scroll body saat menu mobile terbuka, biar halaman di
  // belakangnya nggak ikut ke-scroll.
  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || selectedExperience ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, selectedExperience]);

  // Navbar berubah tampilan (background lebih solid + border) begitu
  // halaman di-scroll turun sedikit dari hero.
  // Satu handler scroll yang di-throttle pakai requestAnimationFrame:
  // mengatur state "scrolled" dan menggeser progress bar (transform saja).
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setIsNavScrolled(y > 24);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (navProgressRef.current) {
        const p = max > 0 ? Math.min(1, y / max) : 0;
        navProgressRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Pill penanda menu aktif: geser/melebar mengikuti link yang aktif.
  useEffect(() => {
    const list = navListRef.current;
    const pill = navPillRef.current;
    if (!list || !pill) return;

    const place = () => {
      const el = list.querySelector('a.active');
      if (!el) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.width = `${el.offsetWidth}px`;
      pill.style.transform = `translate3d(${el.offsetLeft}px, 0, 0)`;
      pill.style.opacity = '1';
    };

    place();
    // Transisi baru dinyalakan setelah posisi awal terpasang,
    // supaya pill tidak "terbang" dari kiri saat halaman dibuka.
    const raf = requestAnimationFrame(() => pill.classList.add('is-ready'));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
    if (ro) ro.observe(list);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [activeSection]);

  // Menu mobile: tutup dengan Esc, atau otomatis kalau layar jadi lebar.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [isMobileMenuOpen]);

  // Scroll-spy: pantau section mana yang lagi kelihatan di viewport,
  // lalu highlight link yang sesuai di navbar.
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Reveal on scroll: elemen ber-class "reveal" muncul pelan (fade + naik)
  // begitu masuk layar. Hanya berjalan sekali per elemen.
  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="portfolio">

      {/* Cahaya aurora lembut di belakang seluruh halaman */}
      <div className="ambient-bg" aria-hidden="true" />

      {/* Splash Cursor (hanya di tema gelap; warnanya tidak cocok di latar terang) */}
      {/* Dimatikan: terlalu berat bila berbarengan dengan WebThreads di hero.
          {hasFinePointer && theme === 'dark' && <Splash />} */}

      {/* Navbar */}
      <nav
        className={`navbar ${isNavScrolled ? 'is-scrolled' : ''}`}
        aria-label="Navigasi utama"
      >
        <a href="#home" className="logo" aria-label="Muhamad A'biddin — kembali ke atas">
          {/* Logo mark: versi putih untuk tema gelap, versi gelap untuk tema terang.
              File ada di /public/logo/. Kalau gambar gagal dimuat, kembali ke teks "MA." */}
          <img
            src={theme === 'light' ? '/logo/logo-mark-dark.svg' : '/logo/logo-mark.svg'}
            alt="MA"
            className="logo-mark"
            height="34"
            style={{ display: 'block', height: 34, width: 'auto' }}
            decoding="async"
            onError={(e) => {
              const link = e.currentTarget.parentElement;
              e.currentTarget.remove();
              if (link && !link.dataset.fallback) {
                link.dataset.fallback = '1';
                link.insertAdjacentText('afterbegin', 'MA.');
              }
            }}
          />
        </a>

        {/* Menu desktop: pill di belakang link bergeser ke menu yang aktif */}
        <div className="nav-menu" ref={navListRef}>
          <span className="nav-pill" ref={navPillRef} aria-hidden="true" />
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'true' : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <ThemeToggle theme={theme} onChange={changeTheme} />

        <a href="#contact" className="nav-button cursor-target">
          Let's Talk
        </a>

        {/* Hamburger — tampil di tablet/HP lewat CSS */}
        <button
          type="button"
          className={`nav-hamburger ${isMobileMenuOpen ? 'is-open' : ''}`}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Garis progress scroll di dasar navbar */}
        <span className="nav-progress" ref={navProgressRef} aria-hidden="true" />
      </nav>

      {/* Latar gelap di belakang menu mobile; klik untuk menutup */}
      <div
        className={`nav-backdrop ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Menu mobile: link muncul berurutan (stagger) */}
      <div
        id="mobile-menu"
        className={`nav-mobile-menu ${isMobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className={activeSection === link.href.slice(1) ? 'active' : ''}
            style={{ '--i': i }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contact"
          className="nav-button"
          style={{ '--i': navLinks.length }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Let's Talk
        </a>
      </div>


      {/* Hero */}
      <section
        id="home"
        className="hero"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        style={{
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        {/* Target Cursor - mount/unmount mengikuti hover di section Hero,
            supaya cursor default otomatis balik begitu mouse keluar dari Hero */}
        {isHeroHovered && hasFinePointer && (
          <TargetCursor
            targetSelector=".cursor-target"
            spinDuration={2}
            hideDefaultCursor={true}
            cursorColor={theme === 'light' ? '#17132b' : '#ffffff'}
            cursorColorOnTarget="#8b5cf6"
          />
        )}

        {/* Background Aurora (CSS saja) + benang SVG ringan */}
        <div className="hero-aurora" aria-hidden="true">
          <span className="hero-aurora-blob hero-aurora-blob--1" />
          <span className="hero-aurora-blob hero-aurora-blob--2" />
          <span className="hero-aurora-blob hero-aurora-blob--3" />
          <span className="hero-aurora-grid" />
        </div>

        {/* Floating 3D Orb: bola ungu melayang (CSS saja, tanpa canvas/WebGL) */}
        <div className="hero-orbs" aria-hidden="true">
          <div className="hero-orb hero-orb--big">
            <span className="hero-orb__ring" />
          </div>
          <div className="hero-orb hero-orb--small" />
          <div className="hero-orb hero-orb--tiny" />
        </div>

        <div
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 1
          }}
        >
          <p className="hero-greeting">
            HELLO, I'M
          </p>

          <h1 className="hero-stroke-title">
            <StrokeText
              key={theme}
              text="Muhamad A'biddin"
              trigger="mount"
              fontSize={heroFontSize}
              fontWeight={700}
              letterSpacing={-Math.round(heroFontSize * 0.05)}
              strokeColor={theme === 'light' ? '#7c3aed' : '#8b5cf6'}
              fillColor={theme === 'light' ? '#17132b' : '#f5f5f5'}
              drawDuration={1.6}
              fillDelay={0.15}
              stagger={0.04}
            />
          </h1>

          <h2>
            Informatics Graduate &amp;{' '}
            <Rotating
              texts={['Web Developer', 'Information Systems Developer', 'Data Enthusiast']}
              mainClassName="hero-rotating-text"
              rotationInterval={2200}
              staggerDuration={0.02}
              splitBy="characters"
            />
          </h2>

          <p className="hero-description">
            I build web-based information systems, from the interface to the
            database, and turn data into reports that help businesses run better.
          </p>

          <div className="hero-buttons">
            <a
              href="#projects"
              className="primary-button cursor-target"
            >
              View My Projects
            </a>

            <a
              href="#about"
              className="secondary-button cursor-target"
            >
              More About Me
            </a>

            <a
              href="/cv.pdf"
              download
              className="secondary-button cursor-target"
            >
              Download CV
            </a>
          </div>

          {/* Social Links */}
          <div className="hero-socials">
            <a
              href="https://github.com/Abidin1203"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="cursor-target"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.94 3.2 9.13 7.65 10.61.56.1.76-.24.76-.54 0-.27-.01-1.16-.02-2.11-3.11.68-3.77-1.32-3.77-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.01-.7.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.1-1.24-5.1-5.53 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.22 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.24-5.12 5.52.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.77.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
              </svg>
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/muhamad-abidin-845098315"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="cursor-target"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z" />
              </svg>
              LinkedIn
            </a>

          </div>
        </div>

      </section>

      {/* About */}
      <section
        id="about"
        className="section about"
      >
        <p className="section-label">
          ABOUT ME
        </p>

        <h2>
          Turning ideas into <span>digital experiences.</span>
        </h2>

        <div className="about-grid">

          {/* Photo / avatar card */}
          <div className="about-photo-card about-photo-card--profile reveal reveal--left">
            <ProfileCard
            name="Muhamad A'biddin"
            title="Web Developer"
            handle="abdnn26"
            status="Online"
            contactText="Contact Me"
            onContactClick={() => {
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            avatarUrl="/about/profile.jpeg"
            holo={0}
            glare={0}
            tiltStrength={12}
            parallax={8}
            radius={20}
            enableTilt
            intro
            showUserInfo
            enableMobileTilt={false}
            theme="auto"
          />
          </div>

          {/* Teks ringkas + linimasa */}
          <div className="about-info">
            <p className="about-text about-text--lead reveal" style={{ '--reveal-delay': '0.1s' }}>
              Saya <strong>Muhamad A’biddin</strong>, lulusan{' '}
              <strong>S1 Informatika</strong> Universitas Sahid Surakarta
              (2022–2026) yang memiliki ketertarikan pada pengembangan{' '}
              <strong>sistem informasi berbasis web</strong> dan{' '}
              <strong>pengolahan data</strong>.
            </p>

            <p className="about-text reveal" style={{ '--reveal-delay': '0.2s' }}>
              Saya berfokus pada pengembangan solusi digital yang dapat membantu
              aktivitas operasional menjadi lebih terstruktur, efisien, dan mudah
              digunakan. Salah satu proyek yang saya kembangkan adalah{' '}
              <strong>POS Kasir Nasi Goreng Kongres</strong>, sistem kasir berbasis
              web yang dirancang untuk mendukung proses transaksi dan pengelolaan
              data penjualan.
            </p>

            <p className="about-text reveal" style={{ '--reveal-delay': '0.3s' }}>
              Selain pengembangan web, saya memperoleh pengalaman belajar di bidang{' '}
              <strong>Data Science</strong> melalui program <strong>MSIB</strong>.
              Pengalaman berorganisasi di <strong>HIMAIF</strong> juga membantu saya
              mengembangkan kemampuan komunikasi, kerja sama tim, dan tanggung jawab.
            </p>

            <p className="about-text reveal" style={{ '--reveal-delay': '0.4s' }}>
              Saya senantiasa terbuka untuk mempelajari hal baru, mengembangkan
              kemampuan, dan berkontribusi dalam proyek di bidang{' '}
              <strong>pengembangan web</strong> maupun{' '}
              <strong>pengelolaan data</strong>.
            </p>

            <div className="about-journey reveal" style={{ '--reveal-delay': '0.5s' }}>
              <div className="about-journey__lead">
                <span className="about-journey__num">
                  <CountUp to={4} duration={1000} />
                </span>
                <span className="about-journey__label">
                  Tahun menempuh
                  <br />
                  S1 Informatika
                </span>
              </div>

              <ol className="about-journey__steps">
                <li>
                  <span className="about-journey__year">2022</span>
                  <span className="about-journey__text">Mulai S1 Informatika</span>
                </li>
                <li>
                  <span className="about-journey__year">2023</span>
                  <span className="about-journey__text">Pertukaran MBKM · RPL</span>
                </li>
                <li>
                  <span className="about-journey__year">2025</span>
                  <span className="about-journey__text">MSIB Data Science</span>
                </li>
                <li>
                  <span className="about-journey__year">2026</span>
                  <span className="about-journey__text">Tugas Akhir · Lulus</span>
                </li>
              </ol>
            </div>
          </div>

        </div>
      </section>

      {/* Education */}
      <section
        id="education"
        className="section education"
      >
        {/* Holographic Sphere 3D di latar (CSS 3D saja, tanpa library) */}
        <HoloSphere />

        <p className="section-label">
          EDUCATION
        </p>

        <h2>
          My academic journey.
        </h2>

        {eduPreview && <PhotoLightbox photo={eduPreview} onClose={() => setEduPreview(null)} />}

        <div className="edu-wrap">
          {/* Daftar jenjang: ketuk baris (+ / −) untuk membuka foto & detail.
              Satu jenjang terbuka dalam satu waktu. */}
          <ol className="edu-list reveal">
            {educationItems.map((item, i) => {
              const isOpen = openEdu === item.label;
              const isFeature = Boolean(item.photoWide || item.photoTall);
              return (
                <li
                  key={item.label}
                  className={`edu-item ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    id={`edu-head-${i}`}
                    className="edu-head"
                    aria-expanded={isOpen}
                    aria-controls={`edu-panel-${i}`}
                    onClick={() => setOpenEdu(isOpen ? null : item.label)}
                  >
                    <span className="edu-level">{item.level}</span>

                    <span className="edu-head-main">
                      <span className="edu-name">{item.label}</span>
                      {item.meta && <span className="edu-sub">{item.meta}</span>}
                    </span>

                    <span className="edu-head-time">
                      <span className="edu-years">{eduRange(item)}</span>
                      {item.badge && <span className="edu-now">{item.badge}</span>}
                    </span>

                    <span className="edu-chev" aria-hidden="true" />
                  </button>

                  <div
                    id={`edu-panel-${i}`}
                    className="edu-panel"
                    role="region"
                    aria-labelledby={`edu-head-${i}`}
                  >
                    <div className="edu-panel-inner">
                      {isFeature ? (
                        /* Pendidikan terakhir: dua foto + IPK + bidang kompetensi */
                        <div className="edu-panel-content edu-panel-content--feature">
                          <div className="edu-feature">
                            <div className="edu-feature__wide">
                              <EduShot
                                src={item.photoWide}
                                alt={`${item.degree || item.label} — foto 1`}
                                onOpen={setEduPreview}
                              />
                            </div>

                            <div className="edu-feature__tall">
                              <EduShot
                                src={item.photoTall}
                                alt={`${item.degree || item.label} — foto 2`}
                                onOpen={setEduPreview}
                              />
                            </div>

                            <div className="edu-feature__info">
                              {item.photoCampus && (
                                <img
                                  className="edu-photo edu-feature__campus-photo"
                                  src={item.photoCampus}
                                  alt={item.label}
                                  loading="lazy"
                                  decoding="async"
                                  onError={hideBrokenImage}
                                />
                              )}
                              {item.degree && <p className="edu-feature__line">{item.degree}</p>}
                              {item.gpa && (
                                <p className="edu-feature__line">
                                  IPK <GpaValue gpa={item.gpa} />
                                </p>
                              )}
                              {item.desc && <p className="edu-feature__desc">{item.desc}</p>}

                              {item.competencies && item.competencies.length > 0 && (
                                <>
                                  <h4 className="edu-feature__heading">Bidang Kompetensi</h4>
                                  <ul className="edu-feature__list">
                                    {item.competencies.map((c) => (
                                      <li key={c}>{c}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="edu-panel-content">
                          {item.desc && <p className="edu-desc">{item.desc}</p>}

                          <img
                            className={`edu-photo ${item.fit === 'cover' ? 'edu-photo--cover' : ''}`}
                            src={item.image}
                            alt={item.label}
                            loading="lazy"
                            decoding="async"
                            onError={hideBrokenImage}
                          />

                          <dl className="edu-facts">
                            <div>
                              <dt>Periode</dt>
                              <dd>{eduRange(item)}</dd>
                            </div>
                            <div>
                              <dt>Lama studi</dt>
                              <dd>{eduDuration(item)}</dd>
                            </div>
                            {item.gpa && (
                              <div>
                                <dt>IPK</dt>
                                <dd>
                                  <GpaValue gpa={item.gpa} />
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Experience / Organization */}
      <section
        id="experience"
        className="section experience"
      >
        <p className="section-label">
          EXPERIENCE & ORGANIZATION
        </p>

        <h2>
          Beyond the classroom.
        </h2>

        {/* Kartu tersusun ke bawah, scroll halaman biasa (laptop & HP sama).
            Tiap kartu muncul pelan (fade + naik) saat masuk layar. */}
        <div className="experience-list-cards">
          {experienceItems.map((item, i) => (
            <div
              key={item.badge}
              className="experience-item reveal"
              style={{ '--reveal-delay': `${(i % 3) * 0.08}s` }}
            >
              <div className="experience-card experience-card--wide experience-card--list">
                <ExperienceCardContent
                  item={item}
                  onOpen={setSelectedExperience}
                />
              </div>
            </div>
          ))}
        </div>

        {selectedExperience && (
          <ExperienceDetail
            item={selectedExperience}
            onClose={() => setSelectedExperience(null)}
          />
        )}
      </section>

      {/* Skills */}
      <section
        id="skills"
        className="section"
      >
        <p className="section-label">
          MY TOOLKIT
        </p>

        <h2>
          Skills &amp; <span>Tools</span>
        </h2>

        <p className="skills-lead reveal">
          Berbagai tools dan teknologi yang saya gunakan untuk membangun
          antarmuka web, mengelola database, serta mengolah data menjadi
          informasi visual yang mudah dipahami.
        </p>

        <div className="skills-meta reveal" style={{ '--reveal-delay': '0.1s' }}>
          <span>
            <strong><CountUp to={skillGroups.length} duration={900} /></strong> kategori
          </span>
          <span>
            <strong><CountUp to={totalTools} duration={1200} /></strong> tools
          </span>
        </div>

        <div className="skills-cards">
          {skillGroups.map((group, i) => (
            <div
              key={group.id}
              className={`skill-group skill-group--${group.id} reveal`}
              style={{ '--reveal-delay': `${i * 0.1}s` }}
              onMouseMove={handleSkillMove}
            >
              <div className="skill-group-head">
                <span className="skill-group-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {group.icon}
                  </svg>
                </span>
                <div className="skill-group-heading">
                  <div className="skill-group-title-row">
                    <h3>{group.title}</h3>
                    <span className="skill-group-tag">{group.tag}</span>
                  </div>
                  <p className="skill-group-desc">{group.desc}</p>
                </div>
              </div>

              <div className="skill-group-grid">
                {group.items.map((tool, n) => (
                  <div key={tool.alt} className="skills-tool-item" style={{ '--d': n }}>
                    <span className="skills-tool-icon-wrap">
                      <img src={tool.src} alt={tool.alt} title={tool.title} />
                    </span>
                    <span>{tool.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section
        id="projects"
        className="section projects"
      >
        {/* Laptop 3D di latar (CSS 3D saja, tanpa library) */}
        <FloatingLaptop />

        <p className="section-label">
          MY PROJECTS
        </p>

        <h2>
          Some things I've built.
        </h2>

        {/* Grid bento: kartu yang disorot tampil berwarna & lebar, sisanya
            abu-abu. Arahkan kursor / fokus keyboard untuk memindahkan sorotan.
            Di HP & layar sentuh kartu menumpuk dan info selalu terlihat. */}
        <div
          className="pj-bento reveal"
          data-active={activeProject}
          onMouseLeave={() => setActiveProject(0)}
        >
          {featuredProjects.map((project, i) => {
            const isActive = activeProject === i;
            const open = () => project.detail && setSelectedExperience(project.detail);
            return (
              <div
                key={project.number}
                className={`pj-card pj-card--${i}${isActive ? ' is-active' : ''}${
                  project.detail ? ' cursor-target' : ''
                }`}
                role={project.detail ? 'button' : undefined}
                tabIndex={project.detail ? 0 : undefined}
                aria-label={`${project.title}${project.detail ? ' — buka detail' : ''}`}
                onMouseEnter={() => setActiveProject(i)}
                onFocus={() => setActiveProject(i)}
                onTouchStart={() => {
                  projectTouchWasActive.current = activeProject === i;
                }}
                onClick={() => {
                  const wasActive = projectTouchWasActive.current;
                  projectTouchWasActive.current = null;
                  if (
                    wasActive === false &&
                    !window.matchMedia('(max-width: 700px)').matches
                  ) {
                    setActiveProject(i);
                    return;
                  }
                  open();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                  }
                }}
              >
                <span className="pj-card__fallback" aria-hidden="true">
                  PROJECT {project.number}
                </span>
                {project.image && (
                  <img
                    className="pj-card__img"
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    onError={hideBrokenImage}
                  />
                )}
                <span className="pj-card__num" aria-hidden="true">{project.number}</span>
                <span className="pj-card__shade" aria-hidden="true" />

                <div className="pj-card__info">
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="pj-card__tech">
                    {project.tech.slice(0, 3).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  {project.detail && (
                    <span className="pj-card__cta">
                      Lihat <span aria-hidden="true">↗</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Project lainnya: daftar ringkas untuk sisa project */}
        {otherProjects.length > 0 && (
          <div className={`pj-more${showMoreProjects ? ' is-open' : ''}`}>
            <button
              type="button"
              className="pj-more__toggle cursor-target"
              aria-expanded={showMoreProjects}
              aria-controls="pj-more-panel"
              onClick={() => setShowMoreProjects((open) => !open)}
            >
              <span>{showMoreProjects ? 'Sembunyikan' : 'Project Lainnya'}</span>
              <span className="pj-more__count">{otherProjects.length}</span>
              <span className="pj-more__chev" aria-hidden="true" />
            </button>

            <div id="pj-more-panel" className="pj-more__panel">
             <div className="pj-more__panel-inner">
              <div className="pj-more__grid">
              {otherProjects.map((project, i) => (
                <article
                  key={project.number}
                  className="pj-more-card"
                  style={{ '--i': i }}
                >
                  <div className="pj-more-card__media">
                    <span className="pj-more-card__fallback" aria-hidden="true">
                      PROJECT {project.number}
                    </span>
                    {project.image && (
                      <img
                        src={project.image}
                        alt={`Tampilan ${project.title}`}
                        loading="lazy"
                        decoding="async"
                        onError={hideBrokenImage}
                      />
                    )}
                  </div>

                  <div className="pj-more-card__body">
                    <span className="pj-more-card__num">Project {project.number}</span>
                    <h4>{project.title}</h4>
                    <p>{project.summary}</p>

                    <div className="pj-more-card__tech">
                      {project.tech.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>

                    {project.detail && (
                      <button
                        type="button"
                        className="experience-details-btn cursor-target"
                        onClick={() => setSelectedExperience(project.detail)}
                      >
                        Details <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
              </div>
             </div>
            </div>
          </div>
        )}
      </section>

      {/* Certifications */}
      <section
        id="certifications"
        className="section certifications"
      >
        <p className="section-label">
          CERTIFICATIONS
        </p>

        <h2>
          Proof of continuous learning.
        </h2>

        <div className="cert-folder-hero">
          <Folder
            color="#8b5cf6"
            size={1.4}
            onToggle={setIsCertFolderOpen}
            items={Object.keys(certificatesData).map((category, i) => (
              <CertFolderPaper key={category} variant={i} title={category} />
            ))}
          />
          <p className="cert-folder-caption">
            {isCertFolderOpen
              ? 'Klik lagi untuk tutup'
              : `Klik folder untuk lihat ${totalCerts} sertifikat`}
          </p>
        </div>

        <div
          className={`cert-categories ${isCertFolderOpen ? 'cert-categories--open' : ''}`}
          aria-hidden={!isCertFolderOpen}
        >
          <div className="cert-categories-inner">
            <CertWall certs={allCerts} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="section contact"
      >
        {/* Floating 3D Envelope di latar (CSS 3D saja, tanpa library) */}
        <FloatingEnvelope />

        <p className="section-label">
          CONTACT
        </p>

        <h2>
          Let's Connect<span className="contact-title-dot">.</span>
        </h2>

        <p className="section-description contact-intro">
          Have a project, opportunity, or just want to say hello? Feel free
          to reach out — I'd love to hear from you.
        </p>


        {/* Semua kontak dibungkus satu kotak besar, gayanya sama seperti Arsip Sertifikat */}
        <div className="cw contact-panel">
          <div className="cw-head">
            <span className="cw-head-label">Hubungi saya</span>
            <span className="contact-head-status">
              <span className="contact-availability__dot" aria-hidden="true" />
              Open to work
            </span>
          </div>

        {/* Kartu info kontak singkat */}
        <div className="contact-info-grid">
          <a
            href="mailto:muhabiddin80354@gmail.com"
            className="contact-info-card cursor-target"
          >
            <span className="contact-info-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </span>
            <span className="contact-info-text">
              <span className="contact-info-label">Email</span>
              <span className="contact-info-value">muhabiddin80354@gmail.com</span>
            </span>
          </a>

          <a
            href="https://wa.me/6285697321736"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-info-card cursor-target"
          >
            <span className="contact-info-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96C22 6.46 17.55 2 12.04 2Zm5.83 14.06c-.25.7-1.45 1.34-2 1.42-.55.08-1 .11-3.24-.68-2.72-1.06-4.47-3.82-4.6-4-.13-.18-1.08-1.43-1.08-2.73s.68-1.94.92-2.2c.24-.26.53-.32.7-.32h.5c.16 0 .38-.03.58.44.24.55.8 1.9.87 2.03.07.13.11.29.02.47-.09.18-.14.29-.27.44-.13.16-.27.36-.39.48-.13.13-.26.27-.11.53.15.26.66 1.09 1.42 1.76.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.06.15-.18.65-.75.82-1.01.17-.26.34-.22.57-.13.23.09 1.47.69 1.72.82.25.13.42.19.48.29.06.11.06.6-.19 1.3Z" />
              </svg>
            </span>
            <span className="contact-info-text">
              <span className="contact-info-label">WhatsApp</span>
              <span className="contact-info-value">+62 856-9732-1736</span>
            </span>
          </a>

          <div className="contact-info-card contact-info-card--static">
            <span className="contact-info-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span className="contact-info-text">
              <span className="contact-info-label">Location</span>
              <span className="contact-info-value">Karawang, Indonesia</span>
            </span>
          </div>
        </div>

        {/* Card besar: form kirim pesan */}
        <div className="contact-form-card">
          <div className="contact-form-info">
            <h3>
              Send Me a <em>Message</em>
            </h3>
            <p>
              Whether it's a collaboration, freelance project, or just a
              quick question — I'm always open to conversation.
            </p>
            <p className="contact-form-note">Biasanya membalas dalam 24 jam.</p>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              style={{ display: 'none' }}
            />
            <div className="contact-form-row">
              <label className="contact-form-field">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  autoComplete="name"
                  maxLength={80}
                  aria-label="Your name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                />
              </label>

              <label className="contact-form-field">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  autoComplete="email"
                  maxLength={120}
                  aria-label="Your email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                />
              </label>
            </div>

            <label className="contact-form-field contact-form-field--textarea">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                maxLength={2000}
                aria-label="Your message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
            </label>

            <div className="contact-form-actions">
              <button
                type="submit"
                className="contact-form-submit cursor-target"
                disabled={contactStatus === 'sending' || contactStatus === 'sent'}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                {contactStatus === 'sending' && 'Sending...'}
                {contactStatus === 'sent' && 'Message Sent!'}
                {contactStatus === 'opened' && 'Opening Email...'}
                {contactStatus === 'error' && 'Try Again'}
                {contactStatus === 'idle' && 'Send Message'}
              </button>
            </div>

            {/* Pesan status: dibacakan pembaca layar, tampil di bawah tombol */}
            <p
              className={`contact-form-status${
                contactStatus === 'sent' || contactStatus === 'opened'
                  ? ' is-success'
                  : contactStatus === 'error'
                    ? ' is-error'
                    : ''
              }`}
              role={contactStatus === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {contactStatus === 'sent' &&
                "Thank you! Your message has been sent. I'll get back to you soon."}
              {contactStatus === 'opened' &&
                `Your email app should open with the message ready. If nothing happens, email me at ${CONTACT.email}.`}
              {contactStatus === 'error' && contactError}
            </p>
          </form>
        </div>
        </div>
      </section>

      <Footer theme={theme} />

    </div>
  )
}

export default App