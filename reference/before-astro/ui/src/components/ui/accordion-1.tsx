// Adapted from Watermelon UI accordion-1 (MIT).
// Original source is retained in accordion-1.original.tsx and the registry snapshot.
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from './accordion';
export type CareItem = {id: string; title: string; tips: string[]};
export default function Accordion1({items}: {items: CareItem[]}) {
  return <Accordion className="wm-care w-full" type="multiple">
    {items.map(item => <AccordionItem key={item.id} value={item.id}>
      <AccordionTrigger className="gap-3">{item.title}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        <ul>{item.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
      </AccordionContent>
    </AccordionItem>)}
  </Accordion>;
}
