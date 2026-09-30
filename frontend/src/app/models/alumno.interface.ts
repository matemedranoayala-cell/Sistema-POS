export interface Alumno {
  id?: number;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  plan_id: number;
  disciplina_id: number;
  fecha_inscripcion?: string;
  estado?: string;
}
