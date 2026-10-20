// Instance Lenis aktif (null di HP, saat "kurangi gerakan" aktif, atau sebelum hidrasi).
// Disimpan di modul agar bagian lain (mis. kunci scroll sheet) bisa menghentikannya sementara.
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export const getLenis = () => lenis;
