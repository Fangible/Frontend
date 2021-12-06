import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { uid } from 'react-uid';
import { IApi_whiteListItem } from '../useFetchWhiteList';
import { useDashTableStyles } from './useDashTableStyles';
import { ReactComponent as DefaultAvatarSvg } from '../assets/defaultAvatar.svg';
import { useHistory } from 'react-router';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';

export const DashTable = ({
  tableDatas,
}: {
  tableDatas: IApi_whiteListItem[];
}) => {
  const classes = useDashTableStyles();
  const history = useHistory();

  return (
    <TableContainer className={classes.tableContainer}>
      <Table>
        <TableHead>
          <TableCell>{'ID'}</TableCell>
          <TableCell>{'Name'}</TableCell>
          <TableCell>{'Address'}</TableCell>
        </TableHead>
        <TableBody>
          {tableDatas.map(tableData => {
            return (
              <TableRow key={uid(tableData)} className={classes.tableRow}>
                <TableCell>{tableData.id}</TableCell>
                <TableCell
                  className={classes.userInfo}
                  onClick={() => {
                    history.push(
                      ProfileRoutesConfig.OtherProfile.generatePath(
                        tableData.address,
                      ),
                    );
                  }}
                >
                  {tableData.image ? (
                    <img src={tableData.image} alt="" />
                  ) : (
                    <DefaultAvatarSvg />
                  )}
                  <span>{tableData.name || 'Untitled'}</span>
                </TableCell>
                <TableCell>{tableData.address}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
