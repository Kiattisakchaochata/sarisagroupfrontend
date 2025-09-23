'use client';

import { Swal } from '@/lib/swal';

// ป้องกันแพตช์ซ้ำ
declare global {
  interface Window { __swalAlertPatched?: boolean }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

if (typeof window !== 'undefined' && !window.__swalAlertPatched) {
  window.__swalAlertPatched = true;

  // แทนที่ window.alert → SweetAlert
  const alertImpl = (msg?: any) => {
    const text = escapeHtml(String(msg ?? '')).replace(/\n/g, '<br/>');
    Swal.fire({
      icon: 'error',
      title: 'แจ้งเตือน',
      html: text || 'เกิดข้อผิดพลาด',
      confirmButtonText: 'ตกลง',
    });
  };

  // แทนที่ window.confirm → SweetAlert (คืนค่า boolean)
  const confirmImpl = async (msg?: any) => {
    const text = escapeHtml(String(msg ?? '')).replace(/\n/g, '<br/>');
    const res = await Swal.fire({
      icon: 'question',
      title: 'ยืนยัน',
      html: text || 'โปรดยืนยัน',
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    });
    return res.isConfirmed;
  };

  // แทนที่ window.prompt → SweetAlert (คืนค่า string|null)
  const promptImpl = async (msg?: any, _default = '') => {
    const text = escapeHtml(String(msg ?? '')).replace(/\n/g, '<br/>');
    const res = await Swal.fire({
      title: 'กรอกข้อมูล',
      html: text,
      input: 'text',
      inputValue: _default,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      inputAutoFocus: true,
    });
    return res.isConfirmed ? (res.value as string) ?? '' : null;
  };

  // ผูกจริง ๆ เข้ากับ window
  window.alert = alertImpl as any;
  window.confirm = confirmImpl as any;
  window.prompt = promptImpl as any;

  // สำหรับโค้ดเก่าที่อาจ import จาก global object แปลก ๆ
  (globalThis as any).alert = window.alert;
  (globalThis as any).confirm = window.confirm;
  (globalThis as any).prompt = window.prompt;
}