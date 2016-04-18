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
        private string[] analogInputs = { "Dev1/ai0", "Dev1/ai1", "Dev1/ai2" };
        private string trigger = "Dev1/PFI0";

        private AnalogMultiChannelReader analogReader;

        private Task readAIsTask;

        public void ConfigureReadAI(int numberOfMeasurements, bool autostart) //AND CAVITY VOLTAGE!!! 
        {
            readAIsTask = new Task("readAI");

            foreach (string s in analogInputs)
            {
                readAIsTask.AIChannels.CreateVoltageChannel(s, s, AITerminalConfiguration.Nrse, -10, 10, AIVoltageUnits.Volts);
            }

            if (autostart == false)
            {
                readAIsTask.Timing.ConfigureSampleClock(
                   "",
                   80000,
                   SampleClockActiveEdge.Rising,
                   SampleQuantityMode.FiniteSamples, numberOfMeasurements);

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