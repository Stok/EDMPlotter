using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NationalInstruments;
using NationalInstruments.DAQmx;


namespace EDMPlotter
{
    public class DAQmxTriggeredMultiAI
    {
        private string[] analogInputs = { "/dev1/ai1", "/dev1/ai2"};
        private string[] inputNames = {"a", "b"};
        private string trigger = "/dev1/PFI0";

        private AnalogMultiChannelReader analogReader;

        private Task readAIsTask;

        public void ConfigureReadAI(int numberOfMeasurements, bool autostart) //AND CAVITY VOLTAGE!!! 
        {
            readAIsTask = new Task("readAI");

            for(int i = 0; i < 2; i++)
            {
                readAIsTask.AIChannels.CreateVoltageChannel(analogInputs[i], inputNames[i], AITerminalConfiguration.Rse, -10, 10, AIVoltageUnits.Volts);
            }

            readAIsTask.Timing.ConfigureSampleClock(
                   "",
                   100000,
                   SampleClockActiveEdge.Rising,
                   SampleQuantityMode.FiniteSamples, numberOfMeasurements);

            if (autostart == false)
            {
                

                readAIsTask.Triggers.StartTrigger.ConfigureDigitalEdgeTrigger(
                    trigger,
                    DigitalEdgeStartTriggerEdge.Rising);
            }
            readAIsTask.Control(TaskAction.Verify);
            analogReader = new AnalogMultiChannelReader(readAIsTask.Stream);
        }


        public double[,] ReadAI(int numberOfMeasurements)
        {
            double[,] data = new double[analogInputs.Length, numberOfMeasurements];//Cheezy Bugfix
            try
            {
                data = analogReader.ReadMultiSample(numberOfMeasurements);
                readAIsTask.WaitUntilDone();
            }
            catch (DaqException e)
            {
                //data = null;
                System.Diagnostics.Debug.WriteLine(e.Message.ToString());
                DisposeAITask();
                ConfigureReadAI(numberOfMeasurements, false);
            }

            return data;
        }


        public void DisposeAITask()
        {
            readAIsTask.Dispose();
        }


    }
}