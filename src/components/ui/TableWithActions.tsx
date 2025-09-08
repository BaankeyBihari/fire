import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'

interface Column {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: (value: any) => string
  width?: string
}

interface TableWithActionsProps {
  title?: string
  columns: Column[]
  data: any[]
  onDelete?: (index: number) => void
  deleteIcon?: React.ReactNode
  emptyMessage?: string
  maxHeight?: number
  stickyHeader?: boolean
}

export const TableWithActions: React.FC<TableWithActionsProps> = ({
  title,
  columns,
  data,
  onDelete,
  deleteIcon = <DeleteIcon />,
  emptyMessage = 'No data available',
  maxHeight,
  stickyHeader = true,
}) => {
  return (
    <Box sx={{ width: '100%', marginY: 2 }}>
      {title && (
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
      )}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: maxHeight,
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
        }}
      >
        <Table stickyHeader={stickyHeader} aria-label={title || 'data table'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: 'grey.50',
                    width: column.width,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {onDelete && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: 'grey.50',
                    width: '60px',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onDelete ? 1 : 0)}
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'grey.50',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id]
                    const displayValue = column.format
                      ? column.format(value)
                      : value

                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{ py: 2 }}
                      >
                        {displayValue}
                      </TableCell>
                    )
                  })}
                  {onDelete && (
                    <TableCell align="center">
                      <IconButton
                        onClick={() => onDelete(index)}
                        color="error"
                        size="small"
                        aria-label={`Delete row ${index + 1}`}
                      >
                        {deleteIcon}
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default TableWithActions
