//Nerdlet to review all data in an account

import React from 'react';
import { PlatformStateContext, NrqlQuery, Spinner, Table, TableHeader, TableHeaderCell, TableRow, TableRowCell, Stack, StackItem, JsonChart, HeadingText, BlockText, Grid, GridItem, LineChart } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventVolumeNerdlet extends React.Component {
  constructor(props){
    super(props);
    console.debug("Props", this); //eslint-disable-line
    this.accountId = 734056;
    this.state = {
      selectedEventType: null,
    };
  }
  
  _onClickTableHeaderCell(key, event, sortingData) {
    this.setState({ [key]: sortingData.nextSortingType });
  }
  
  render() {
    console.debug("State: ", this.state)
    const { selectedEventType } = this.state;
    const eventTypeQuery = `SHOW eventTypes`
    const eventTimeseriesQuery = `FROM \`${selectedEventType}\` SELECT bytecountestimate() TIMESERIES`
    return(
      <PlatformStateContext.Consumer>
        {(platformUrlState) => {
          console.debug(platformUrlState);
          const { duration } = platformUrlState.timeRange;
          const since = ` SINCE ${duration/60000} minutes ago`
          return(
            <Grid class-name="primary-grid" spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
              <GridItem className="primary-content-container" columnSpan={12}>
                <Stack fullWidth directionType={Stack.DIRECTION_TYPE.HORIZONTAL} gapType={Stack.GAP_TYPE.LOOSE}>
                  <StackItem grow={true} className="row-spacing">
                  <HeadingText style={{marginLeft: '25px'}}>Event Types in this Account</HeadingText>
                    <NrqlQuery accountId={this.accountId} query={eventTypeQuery + since}>
                      {({loading, error, data}) => {
                        if (loading) return <Spinner />
                        if (error) return <BlockText>{error.message}</BlockText>
                        if (data) {
                          console.debug('Raw Data:', data[0].data[0])
                          // data[0].data[0].eventTypes.forEach((item, i) => {
                          //   console.debug('Item:', item);
                          // });
                        }
                        return(
                          <Table items={data[0].data[0].eventTypes} className="top-chart">
                            <TableHeader>
                              <TableHeaderCell
                                value={({ item }) => item}
                                sortable
                                sortingType={this.state.column_0}
                                sortingOrder={0}
                                onClick={this._onClickTableHeaderCell.bind(this, 'column_0')}
                                width="fit-content"
                              >
                                Event Type
                              </TableHeaderCell>
                              <TableHeaderCell>
                                Amount of Data (GB) 
                              </TableHeaderCell>
                            </TableHeader>
                            {({ item }) => (
                              <TableRow onClick={(evt, item, index) => {
                                console.debug("Clicked:", item)
                                this.setState({ selectedEventType: item.item })
                              }}>
                                <TableRowCell>
                                  {item}
                                </TableRowCell>
                                <TableRowCell alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}>
                                  <NrqlQuery accountId={this.accountId} query={`FROM \`${item}\` SELECT bytecountestimate() ` + since}>
                                    {({ data, loading, error }) => {
                                      if (loading) return <Spinner />
                                      if (error) return <BlockText>{error.message}</BlockText>
                                      if (data) {
                                        //console.debug('Volume data:', data[0].data[0].bytecountestimate)
                                        var dataGb = data[0].data[0].bytecountestimate/10e8
                                        dataGb = dataGb.toFixed(2)
                                        return(dataGb)
                                      }
                                    }}
                                  </NrqlQuery>
                                </TableRowCell>  
                              </TableRow>
                            )
                          }
                          </Table>
                        );
                      }}
                    </NrqlQuery> 
                  </StackItem>
                </Stack>
                { selectedEventType && <Stack fullWidth gapType={Stack.GAP_TYPE.LOOSE}>
                  {console.debug("Timeseries Event Type:", selectedEventType)}
                  <StackItem grow={true} className="row-spacing">
                    <HeadingText style={{marginLeft: '25px'}}>{selectedEventType} Volume Timeseries (bytes)</HeadingText>
                    <LineChart accountId={this.accountId} className="chart" query={eventTimeseriesQuery + since}/>
                  </StackItem>
                </Stack>
                }
              </GridItem>
            </Grid>
          );
        }}
      </PlatformStateContext.Consumer>
    );
  }
}
