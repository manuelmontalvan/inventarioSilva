import axios from "@/lib/axiosInstance";

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
}

export const getUnitsOfMeasure = async (): Promise<UnitOfMeasure[]> => {
  const res = await axios.get("/units");
  console.log("Respuesta units:", res.data);
  return res.data;
};


export const createUnitOfMeasure = async (data: {
  name: string;
  abbreviation: string;
}): Promise<UnitOfMeasure> => {
  const res = await axios.post("/units", data, { withCredentials: true });
  return res.data;
};

export const updateUnitOfMeasure = async (
  id: string,
  data: { name: string; abbreviation: string }
): Promise<UnitOfMeasure> => {
  const res = await axios.put(`/units/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteUnitOfMeasure = async (id: string): Promise<null> => {
  const res = await axios.delete(`/units/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};
