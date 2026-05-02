import { useState, useEffect, useMemo } from 'react';
import { firebaseService } from '../services/firebaseService';

export const useSurveyData = () => {
  const [data, setData] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState(null);

  useEffect(() => {
    const unsub = firebaseService.subscribeToResponses((dataList) => {
      setData(dataList);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    try {
      await firebaseService.deleteResponse(id);
      return { success: true };
    } catch (error) {
      console.error("Gagal menghapus:", error);
      return { success: false, error };
    }
  };

  // Processing logic memodifikasi data array
  const eduData = useMemo(() => {
    const eduCount = data.reduce((acc, curr) => {
      acc[curr.education] = (acc[curr.education] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(eduCount).map(key => ({ name: key, value: eduCount[key] }));
  }, [data]);

  const ageData = useMemo(() => {
    const ageCount = data.reduce((acc, curr) => {
      acc[curr.age] = (acc[curr.age] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(ageCount)
      .map(key => ({ age: key, count: ageCount[key] }))
      .sort((a,b) => Number(a.age) - Number(b.age));
  }, [data]);

  const majorData = useMemo(() => {
    const majorCount = data.reduce((acc, curr) => {
      if(!curr.major) return acc;
      const m = curr.major.toUpperCase().trim();
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(majorCount)
      .map(key => ({ name: key, count: majorCount[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  return {
    data,
    selectedEducation,
    setSelectedEducation,
    handleDelete,
    eduData,
    ageData,
    majorData
  };
};
