export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
}

export const hospitals: Hospital[] = [
  { id: "H001", name: "ABC Hospital", city: "Chennai", state: "Tamil Nadu" },
  { id: "H002", name: "KMCH Hospital", city: "Coimbatore", state: "Tamil Nadu" },
  { id: "H003", name: "Apollo Hospital", city: "Chennai", state: "Tamil Nadu" },
  { id: "H004", name: "Manipal Hospital", city: "Bangalore", state: "Karnataka" },
  { id: "H005", name: "SKS Hospital", city: "Salem", state: "Tamil Nadu" },
  { id: "H006", name: "Meenakshi Mission Hospital", city: "Madurai", state: "Tamil Nadu" },
  { id: "H007", name: "MGM Healthcare", city: "Chennai", state: "Tamil Nadu" },
  { id: "H008", name: "Narayana Health", city: "Bangalore", state: "Karnataka" },
  { id: "H009", name: "KG Hospital", city: "Coimbatore", state: "Tamil Nadu" },
];
