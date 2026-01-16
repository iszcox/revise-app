export interface Lesson {
  id: string;
  title: string;
  note: string; // "add a note about the course"
  createdAt: number;
  lastRevised: number | null; // Null if never revised
  proficiency: number; // 1 (Hard) to 4 (Easy). Default 1.
}