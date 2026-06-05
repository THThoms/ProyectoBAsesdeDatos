import dayjs from 'dayjs';

export const fmtFecha = (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-';
export const fmtFechaHora = (d) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-';
export const fmtMoneda = (n) => n != null ? `$ ${Number(n).toFixed(2)}` : '-';
