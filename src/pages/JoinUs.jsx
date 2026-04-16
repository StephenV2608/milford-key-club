import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinUs() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/pages/join', { replace: true }); }, []);
  return null;
}