import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AudioUploaderDashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploadSummary, setUploadSummary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    try {
      const response = await axios.post('http://localhost:8000/upload-and-process/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSummary(response.data.results);
      setShowModal(true);
      fetchTableData();
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed!');
    }
  };

  const fetchTableData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/fetch-db-records');
      setTableData(res.data);
    } catch (err) {
      console.error('DB Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const filteredData = tableData.filter((row) => {
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="p-4">
        <CardContent className="space-y-4">
          <Input type="file" accept=".wav" multiple onChange={handleFileChange} />
          <Button onClick={handleUpload}>Upload & Process</Button>
        </CardContent>
      </Card>

      {/* Modal Upload Summary */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {uploadSummary.map((item, idx) => (
              <div key={idx} className="border p-2 rounded shadow-sm">
                <p><strong>Ticket ID:</strong> {item.ticket_id || 'N/A'}</p>
                <p><strong>Name:</strong> {item.analysis?.caller_name || 'Unknown'}</p>
                <p><strong>Filename:</strong> {item.file}</p>
                <p><strong>DB Status:</strong> {item.db_status}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Bar */}
      <Input
        placeholder="Search in records..."
        className="w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded shadow-md">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Ticket ID</th>
              <th className="p-2">Caller Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Crime Type</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Audio File</th>
              <th className="p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{record.ticket_id}</td>
                <td className="p-2">{record.caller_name}</td>
                <td className="p-2">{record.phone_number}</td>
                <td className="p-2">{record.crime_type}</td>
                <td className="p-2">{record.severity_rank}</td>
                <td className="p-2">{record.audio_file}</td>
                <td className="p-2">{new Date(record.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AudioUploaderDashboard;
