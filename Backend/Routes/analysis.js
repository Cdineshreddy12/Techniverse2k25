import express from 'express';
const router=express.Router();
import XLSX from 'xlsx';
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  });
const upload = multer({ storage });
router.post('/analyze-registrations', upload.single('excelFile'), async (req, res) => {
    try {
        // Stream the file from memory
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Use streams to process data in chunks
        const chunkSize = 1000; // Process 1000 records at a time
        let processedCount = 0;
        
        // Get registered students' emails using MongoDB index with batch processing
        const batchSize = 1000;
        const registeredEmails = new Set();
        
        // Use cursor for memory efficiency
        const cursor = Student.find(
            { registeredEvents: { $exists: true, $ne: [] } },
            { email: 1, _id: 0 }
        ).lean().cursor({ batchSize });
        
        // Process in batches
        let doc;
        while ((doc = await cursor.next())) {
            registeredEmails.add(doc.email);
        }

        // Initialize analysis structure with Map for better performance
        const analysis = {
            departments: new Map(),
            total: {
                registered: 0,
                unregistered: 0
            }
        };

        // Convert worksheet to array of objects
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        // Process data in chunks
        for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize);
            
            // Process each row in the chunk
            chunk.forEach(student => {
                const dept = student.department;
                const year = student.year;
                
                // Use Map operations instead of object properties
                if (!analysis.departments.has(dept)) {
                    analysis.departments.set(dept, {
                        years: new Map(),
                        departmentTotal: {
                            registered: 0,
                            unregistered: 0
                        }
                    });
                }
                
                const deptData = analysis.departments.get(dept);
                if (!deptData.years.has(year)) {
                    deptData.years.set(year, {
                        registered: [],
                        unregistered: []
                    });
                }

                // Efficient lookup using Set
                if (registeredEmails.has(student.email)) {
                    deptData.years.get(year).registered.push({
                        name: student.name,
                        email: student.email,
                        rollNumber: student.rollNumber
                    });
                    deptData.departmentTotal.registered++;
                    analysis.total.registered++;
                } else {
                    deptData.years.get(year).unregistered.push({
                        name: student.name,
                        email: student.email,
                        rollNumber: student.rollNumber
                    });
                    deptData.departmentTotal.unregistered++;
                    analysis.total.unregistered++;
                }
            });

            processedCount += chunk.length;
            
            // Send progress updates
            if (req.socket.writable) {
                res.write(JSON.stringify({ progress: (processedCount / rows.length) * 100 }));
            }
        }

        // Convert Map to regular object for JSON response
        const responseData = {
            departments: Object.fromEntries(
                Array.from(analysis.departments.entries()).map(([dept, data]) => [
                    dept,
                    {
                        ...data,
                        years: Object.fromEntries(data.years)
                    }
                ])
            ),
            total: analysis.total
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export default router;