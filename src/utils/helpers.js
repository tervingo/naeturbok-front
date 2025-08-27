// Formatear fechas
export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('is-IS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  export const formatDateShort = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('is-IS');
  };
  
  // Formatear tiempo
  export const formatTime = (timeStr) => {
    return timeStr || '--:--';
  };
  
  // Inicializar estructura de registro vacío
  export const initializeRecord = (date = null) => ({
    date: date || new Date().toISOString().split('T')[0],
    upplýsingar: {
      hvar: '',
      kaffi: 0,
      áfengi: { bjór: 0, vín: 0, annar: 0 },
      æfing: { type: 'nej', km: null },
      sðl: false,
      'lip-riv': '',
      'sið lio': '',
      kvöldmatur: '',
      'sið lát': '',
      'að sofa': '',
      natft: false,
      bl: false,
      pap: false
    },
    lekar: [],
    lát: [],
    athugasemd: '',
    ready: false
  });
  
  // Validar si un registro está completo
  export const isRecordComplete = (record) => {
    const required = ['date'];
    return required.every(field => record[field] && record[field].toString().trim() !== '');
  };
  
  // Calcular estadísticas del registro
  export const calculateRecordStats = (record) => {
    const totalLekar = record.lekar?.length || 0;
    const totalLát = record.lát?.length || 0;
    const averageIntensity = totalLekar > 0 
      ? record.lekar.reduce((sum, leak) => sum + leak.styrkur, 0) / totalLekar 
      : 0;
    
    const totalAlcohol = record.upplýsingar?.áfengi
      ? (record.upplýsingar.áfengi.bjór || 0) + 
        (record.upplýsingar.áfengi.vín || 0) + 
        (record.upplýsingar.áfengi.annar || 0)
      : 0;
  
    return {
      totalLekar,
      totalLát,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      totalAlcohol,
      hasExercise: record.upplýsingar?.æfing && record.upplýsingar.æfing.type !== 'nej',
      coffeeCups: record.upplýsingar?.kaffi || 0
    };
  };
  
  // Obtener texto legible para valores de enum
  export const getExerciseText = (æfing) => {
    if (!æfing || æfing.type === 'nej') return 'nej';
    if (æfing.type === 'labba' && æfing.km) {
      return `${æfing.type} (${æfing.km} km)`;
    }
    return æfing.type;
  };
  
  export const getIntensityText = (value) => {
    const texts = {
      1: 'Létt',
      2: 'Miðlungs',
      3: 'Sterkt'
    };
    return texts[value] || 'Óþekkt';
  };
  
  export const getNeedText = (value) => {
    const texts = {
      0: 'Engin',
      1: 'Einhver',
      2: 'Mikil'
    };
    return texts[value] || 'Óþekkt';
  };
  
  export const getFlowText = (value) => {
    const texts = {
      0: 'Lítið',
      1: 'Miðlungs',
      2: 'Mikið'
    };
    return texts[value] || 'Óþekkt';
  };
  
  // Filtrar registros por rango de fechas
  export const filterRecordsByDateRange = (records, startDate, endDate) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;
      
      return true;
    });
  };
  
  // Generar colores para gráficos
  export const generateColors = (count) => {
    const baseColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  };
  
  // Debounce para búsquedas
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };