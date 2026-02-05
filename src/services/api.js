
class ApiService {
  async request(endpoint, options = {}) {
    const API_BASE_URL = 'https://naeturbok-back.onrender.com/api';
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        let errorMessage;
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else {
            errorMessage = JSON.stringify(data.error);
          }
        } else {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Records endpoints
  async getRecords(startDate = null, endDate = null) {
    let endpoint = '/records';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.request(endpoint);
  }

  async getRecord(id) {
    return this.request(`/records/${id}`);
  }

  async createRecord(recordData) {
    // Remove fields that shouldn't be sent to the API
    const { _id, fjöldiLeka, 'fjöldi leka': fjoldiLeka, ...cleanData } = recordData;
    
    return this.request('/records', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async updateRecord(id, recordData) {
    // Remove fields that shouldn't be sent to the API
    const { _id, fjöldiLeka, 'fjöldi leka': fjoldiLeka, ...cleanData } = recordData;
    
    return this.request(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData),
    });
  }

  async deleteRecord(id) {
    return this.request(`/records/${id}`, {
      method: 'DELETE',
    });
  }

  async healthCheck() {
    return this.request('/health');
  }

  // PostOp endpoints
  async getPostopList(startDate = null, endDate = null) {
    let endpoint = '/postop';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.request(endpoint);
  }

  async createPostop(data) {
    const { _id, ...clean } = data;
    if (clean['or-mp'] === 'no') delete clean['mp-por'];
    return this.request('/postop', {
      method: 'POST',
      body: JSON.stringify(clean),
    });
  }

  async updatePostop(id, data) {
    const { _id, ...clean } = data;
    if (clean['or-mp'] === 'no') delete clean['mp-por'];
    return this.request(`/postop/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clean),
    });
  }

  async deletePostop(id) {
    return this.request(`/postop/${id}`, {
      method: 'DELETE',
    });
  }

  async exportToExcel(records, startDate = null, endDate = null) {
    // Import xlsx dynamically to avoid bundle size issues
    const XLSX = await import('xlsx');
    
    // Filter records by date if provided
    let filteredRecords = records;
    if (startDate || endDate) {
      filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Prepare data for Excel
    const excelData = filteredRecords.map(record => {
      const row = {
        'Fecha': record.date,
        'Ubicación': record.upplýsingar?.hvar || '',
        'Café': record.upplýsingar?.kaffi || 0,
        'Ejercicio': this.getExerciseText(record.upplýsingar?.æfing || 0),
        'Cerveza': record.upplýsingar?.áfengi?.bjór || 0,
        'Vino': record.upplýsingar?.áfengi?.vín || 0,
        'Otro alcohol': record.upplýsingar?.áfengi?.annar || 0,
        'SÐL': record.upplýsingar?.sðl ? 'Sí' : 'No',
        'Sið Lip': record.upplýsingar?.['sið lip'] || '',
        'Sið-Riv': record.upplýsingar?.['sið-riv'] || '',
        'Sið lio': record.upplýsingar?.['sið lio'] || '',
        'Cena': record.upplýsingar?.kvöldmatur || '',
        'Sið lát': record.upplýsingar?.['sið lát'] || '',
        'A dormir': record.upplýsingar?.['að sofa'] || '',
        'Natft': record.upplýsingar?.natft ? 'Sí' : 'No',
        'BL': record.upplýsingar?.bl ? 'Sí' : 'No',
        'Pap': record.upplýsingar?.pap ? 'Sí' : 'No',
        'Tamsul': record.upplýsingar?.tamsul ? 'Sí' : 'No',
        'Total Lekar': record.lekar?.length || 0,
        'Total Lát': record.lát?.length || 0,
        'Comentarios': record.athugasemd || ''
      };

      // Add leak details
      if (record.lekar && record.lekar.length > 0) {
        record.lekar.forEach((leak, index) => {
          row[`Leki ${index + 1} - Tiempo`] = leak.tími || '';
          row[`Leki ${index + 1} - Intensidad`] = this.getIntensityText(leak.styrkur);
          row[`Leki ${index + 1} - Necesidad`] = this.getNeedText(leak.þörf);
          row[`Leki ${index + 1} - Advertencia`] = leak.aðvarun ? 'Sí' : 'No';
        });
      }

      // Add lát details
      if (record.lát && record.lát.length > 0) {
        record.lát.forEach((lat, index) => {
          row[`Lát ${index + 1} - Tiempo`] = lat.tími || '';
          row[`Lát ${index + 1} - Flujo`] = this.getFlowText(lat.flaedi);
        });
      }

      return row;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Apply row colors based on the same logic as RecordList
    if (excelData.length > 0) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      filteredRecords.forEach((record, index) => {
        const lekarCount = record['fjöldi leka'] || 0;
        const latCount = record.lát?.length || 0;
        
        let fillColor;
        
        if (lekarCount === 0 && latCount === 1) {
          // Blue background for lekar = 0 and lát = 1
          fillColor = "00FFFF"; // aqua
        } else if (lekarCount === 0) {
          // Green background for lekar = 0 and lát > 1
          fillColor = "32FF32"; // limegreen
        } else {
          // Red background for lekar > 0
          fillColor = "FFA07A"; // lightsalmon
        }
        
        // Apply color to entire row (data starts at row 1, index 0 is headers)
        const rowNum = index + 1;
        
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
          if (!worksheet[cellRef]) {
            worksheet[cellRef] = { v: "", t: "s" };
          }
          if (!worksheet[cellRef].s) {
            worksheet[cellRef].s = {};
          }
          worksheet[cellRef].s.fill = {
            fgColor: { rgb: fillColor }
          };
        }
      });
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

    // Generate filename with date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `naeturbok_export_${dateStr}.xlsx`;

    // Save file to Downloads folder (browser will handle the actual save location)
    XLSX.writeFile(workbook, filename);

    return { success: true, filename };
  }

  // Helper methods for text conversion
  getExerciseText(value) {
    const texts = { 0: 'Nei', 1: 'Létt', 2: 'Þung' };
    return texts[value] || 'Nei';
  }

  getIntensityText(value) {
    const texts = { 1: 'Létt', 2: 'Miðlungs', 3: 'Sterkt' };
    return texts[value] || 'Óþekkt';
  }

  getNeedText(value) {
    const texts = { 0: 'Engin', 1: 'Einhver', 2: 'Mikil' };
    return texts[value] || 'Óþekkt';
  }

  getFlowText(value) {
    const texts = { 0: 'Lítið', 1: 'Miðlungs', 2: 'Mikið' };
    return texts[value] || 'Óþekkt';
  }
}

const apiService = new ApiService();
export default apiService;