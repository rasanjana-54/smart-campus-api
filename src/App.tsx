/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Cpu, 
  Plus, 
  Trash2, 
  Activity, 
  AlertCircle, 
  RefreshCcw, 
  Thermometer,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  capacity: number;
  sensorIds: string[];
}

interface Sensor {
  id: string;
  type: string;
  status: string;
  currentValue: number;
  roomId: string;
}

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRoom, setNewRoom] = useState({ id: '', name: '', capacity: 0 });
  const [newSensor, setNewSensor] = useState({ id: '', type: 'Temperature', status: 'ACTIVE', roomId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, sensorsRes] = await Promise.all([
        fetch('/api/v1/rooms'),
        fetch('/api/v1/sensors')
      ]);
      const roomsData = await roomsRes.json();
      const sensorsData = await sensorsRes.json();
      setRooms(roomsData);
      setSensors(sensorsData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    try {
      const res = await fetch('/api/v1/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      if (res.status === 409) {
        const data = await res.json();
        alert(data.message);
        return;
      }
      fetchData();
      setNewRoom({ id: '', name: '', capacity: 0 });
    } catch (err) {
      alert('Error adding room');
    }
  };

  const addSensor = async () => {
    try {
      const res = await fetch('/api/v1/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSensor)
      });
      if (res.status === 422) {
        const data = await res.json();
        alert(data.message);
        return;
      }
      fetchData();
      setNewSensor({ ...newSensor, id: '' });
    } catch (err) {
      alert('Error adding sensor');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/rooms/${id}`, { method: 'DELETE' });
      if (res.status === 409) {
        const data = await res.json();
        alert(data.message);
        return;
      }
      fetchData();
    } catch (err) {
      alert('Error deleting room');
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCcw className="w-8 h-8 text-gray-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-900 font-sans selection:bg-orange-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Smart<span className="text-orange-600">Campus</span>
            </h1>
            <p className="text-gray-500 font-medium">Sensor & Room Management Infrastructure</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-600">API Status: Online</span>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Management */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  Campus Rooms
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {rooms.map((room) => (
                    <motion.div
                      layout
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group bg-white p-6 rounded-3xl border transition-all duration-300 ${
                        selectedRoom?.id === room.id 
                          ? 'border-orange-500 ring-2 ring-orange-100' 
                          : 'border-transparent shadow-sm hover:shadow-md'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${selectedRoom?.id === room.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" /> {room.id}
                        </span>
                        <span>Cap: {room.capacity}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {room.sensorIds.map(sid => (
                          <span key={sid} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg text-gray-400 border border-gray-100">
                            {sid}
                          </span>
                        ))}
                        {room.sensorIds.length === 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 italic">No Sensors</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col justify-center min-h-[200px]">
                  <h3 className="font-bold text-gray-400 mb-4 text-center">Add New Room</h3>
                  <div className="space-y-3">
                    <input 
                      placeholder="Room ID (e.g. LIB-301)" 
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-sm"
                      value={newRoom.id}
                      onChange={e => setNewRoom({...newRoom, id: e.target.value})}
                    />
                    <input 
                      placeholder="Room Name" 
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-sm"
                      value={newRoom.name}
                      onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        placeholder="Capacity" 
                        className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-sm"
                        value={newRoom.capacity || ''}
                        onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 0})}
                      />
                      <button 
                        onClick={addRoom}
                        className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-orange-600" />
                  Deployed Sensors
                </h2>
              </div>
              
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-bottom border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">ID / Type</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Location</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Curr. Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sensors.map(sensor => (
                      <tr key={sensor.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold">{sensor.id}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 font-medium italic">
                             {sensor.type === 'Temperature' && <Thermometer className="w-3 h-3" />}
                             {sensor.type === 'Occupancy' && <Zap className="w-3 h-3" />}
                             {sensor.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                            sensor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                            sensor.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {sensor.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {sensor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {sensor.roomId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xl font-mono font-medium">
                            {sensor.currentValue.toFixed(1)}
                            <span className="text-xs ml-1 opacity-40">
                              {sensor.type === 'Temperature' ? '°C' : '%'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Add Sensor Form Row */}
                    <tr className="bg-orange-50/30">
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                           <input 
                            placeholder="ID"
                            className="bg-white px-3 py-1 rounded-lg border border-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-300 text-sm w-24"
                            value={newSensor.id}
                            onChange={e => setNewSensor({...newSensor, id: e.target.value})}
                          />
                          <select 
                            className="bg-white px-3 py-1 rounded-lg border border-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-300 text-sm"
                            value={newSensor.type}
                            onChange={e => setNewSensor({...newSensor, type: e.target.value})}
                          >
                            <option>Temperature</option>
                            <option>Occupancy</option>
                            <option>CO2</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-white px-3 py-1 rounded-lg border border-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-300 text-sm"
                          value={newSensor.status}
                          onChange={e => setNewSensor({...newSensor, status: e.target.value})}
                        >
                          <option>ACTIVE</option>
                          <option>MAINTENANCE</option>
                          <option>OFFLINE</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          placeholder="Room ID"
                          className="bg-white px-3 py-1 rounded-lg border border-orange-100 focus:outline-none focus:ring-1 focus:ring-orange-300 text-sm w-28"
                          value={newSensor.roomId}
                          onChange={e => setNewSensor({...newSensor, roomId: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={addSensor}
                          className="w-full py-1 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors"
                        >
                          Register
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Details & Help */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-6">Coursework Info</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Technology Stack</div>
                    <div className="text-xs text-gray-400">JAX-RS / Maven / Java 11</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Forbidden Tech</div>
                    <div className="text-xs text-gray-400">No Spring Boot, No SQL</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
                <h4 className="font-bold text-sm mb-2">Submission Checklist</h4>
                <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                  <li>Public GitHub Repo</li>
                  <li>README.md with answers</li>
                  <li>Video demo (Max 10 mins)</li>
                  <li>Only use HashMap/ArrayList</li>
                </ul>
              </div>
            </section>

            <section className="bg-orange-600 p-8 rounded-3xl text-white shadow-lg shadow-orange-100">
              <h3 className="text-2xl font-bold mb-4">REST Principles</h3>
              <p className="text-orange-100 text-sm leading-relaxed mb-6">
                This API demonstrates resource nesting, HATEOAS discovery, 
                and robust error mapping following industry standards.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/20 pb-2">
                  <span>Discovery</span>
                  <span className="font-mono bg-white/20 px-2 rounded tracking-tight">/api/v1</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-white/20 pb-2">
                  <span>Resource Locator</span>
                  <span className="font-mono bg-white/20 px-2 rounded tracking-tight">/read</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span>Error Mapping</span>
                  <span className="font-mono bg-white/20 px-2 rounded tracking-tight">422 / 409</span>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-sm font-medium">University of Westminster • Client-Server Architectures 2025/26</p>
        </footer>
      </div>
    </div>
  );
}

