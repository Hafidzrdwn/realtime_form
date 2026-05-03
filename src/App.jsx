import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './pages/Form';
import Check from './pages/Check';
import Result from './pages/Result';
import DynamicForm from './pages/DynamicForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/check" element={<Check />} />
        <Route path="/result" element={<Result />} />
        <Route path="/forms/:slug" element={<DynamicForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
