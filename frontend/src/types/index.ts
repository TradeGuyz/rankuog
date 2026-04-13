export interface GpaPerYear {
  academic_year: string
  gpa: number
}

export interface Student {
  id: string
  display_name: string
  student_id: string
  department: string
  overall_gpa: number
  enrolment_year: number
  gpa_per_year: GpaPerYear[]
  is_current_user?: boolean
}
