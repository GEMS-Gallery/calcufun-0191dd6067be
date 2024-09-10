import React, { useState } from 'react';
import { Button, Paper, TextField, Grid, CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import { backend } from 'declarations/backend';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      try {
        const result = await backend.calculate(firstOperand, inputValue, operator);
        setDisplay(result.toString());
        setFirstOperand(result);
      } catch (error) {
        setDisplay('Error');
      } finally {
        setLoading(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} style={{ padding: '1rem', maxWidth: '300px', margin: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={display}
          InputProps={{
            readOnly: true,
            style: { textAlign: 'right', fontSize: '1.5rem' }
          }}
          margin="normal"
        />
        <Grid container spacing={1}>
          {buttons.map((btn) => (
            <Grid item xs={3} key={btn}>
              <Button
                fullWidth
                variant="contained"
                color={['/', '*', '-', '+', '='].includes(btn) ? 'secondary' : 'primary'}
                onClick={() => {
                  if (btn === '=') {
                    performOperation('=');
                  } else if (['+', '-', '*', '/'].includes(btn)) {
                    performOperation(btn);
                  } else if (btn === '.') {
                    inputDecimal();
                  } else {
                    inputDigit(btn);
                  }
                }}
              >
                {btn}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={clear}
          style={{ marginTop: '1rem' }}
        >
          Clear
        </Button>
        {loading && (
          <CircularProgress
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-20px',
              marginLeft: '-20px',
            }}
          />
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default App;
