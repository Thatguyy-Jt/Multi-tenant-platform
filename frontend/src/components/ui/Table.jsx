import React from 'react';
import { cn } from '../../lib/utils';

const Table = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ 
  children, 
  className = '' 
}) => {
  return (
    <thead className={cn("border-b border-white/10", className)}>
      {children}
    </thead>
  );
};

const TableBody = ({ 
  children, 
  className = '' 
}) => {
  return (
    <tbody className={cn("divide-y divide-white/5", className)}>
      {children}
    </tbody>
  );
};

const TableRow = ({ 
  children, 
  className = '',
  hover = true 
}) => {
  return (
    <tr
      className={cn(
        "transition-colors duration-200",
        hover && "hover:bg-white/5",
        className
      )}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ 
  children, 
  className = '' 
}) => {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
};

const TableCell = ({ 
  children, 
  className = '' 
}) => {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm text-zinc-300",
        className
      )}
    >
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
