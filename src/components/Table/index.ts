import Card from 'components/Card'
import styled from 'styled-components/macro'

export const Table = styled.table`
  width: 100%;
  color: white;
`

export const TableWithBorder = styled(Table)`
  border: 0.5px solid ${({ theme }) => theme.purple2};
  border-radius: 20px;
  background-color: rgba(148, 93, 200, 0.11);
`

export const Th = styled.th`
  text-align: center;
  padding: 10px;
  color: white;
  font-weight: normal;
  font-size: 14px;
`

export const Td = styled.td`
  padding: 10px;
  text-align: center;
  font-size: 14px; /* Removed the quotes */
`

export const TableContainer = styled(Card)`
  padding: 0;
  overflow: auto;
`
