import * as React from 'react';
import {createRoot} from 'react-dom/client';
import Accordion1, {type CareItem} from './components/ui/accordion-1';
import './styles.css';
declare global { interface Window {kanishkaUI?: {renderCare: (items: CareItem[]) => void}} }
const host = document.getElementById('care-guide');
if (host) {
  const root = createRoot(host);
  window.kanishkaUI = {renderCare(items) {root.render(<Accordion1 items={items}/>);}};
  window.dispatchEvent(new Event('kanishka-ui-ready'));
}
