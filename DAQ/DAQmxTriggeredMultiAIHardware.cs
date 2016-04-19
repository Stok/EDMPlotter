using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NationalInstruments;
using NationalInstruments.DAQmx;
using SharedCode;

namespace DAQ
{
	public class DAQmxTriggeredMultiAIHardware : IExperimentHardware
    {
        private string[] analogInputs = { "/dev1/ai1", "/dev1/ai2"};
        private string[] inputNames = {"a", "b"};
        private string trigger = "/dev1/PFI0";

		object updateDataLock = new object();

        private AnalogMultiChannelReader analogReader;

        private Task readAIsTask;

		DataSet data;
		ExperimentParameters parameters;

		#region public region

		public void Initialise(ExperimentParameters p)
		{
			parameters = p;
			configureReadAI (parameters.NumberOfPoints, false);
		}

		public DataSet Run()
		{
			double[,] d = readAI (parameters.NumberOfPoints);
			lock (updateDataLock)
			{
				for (int i = 0; i < parameters.NumberOfPoints; i++)
				{
					data.Add(new DataPoint(i, d[0, i]));
				}
			}
			return data;
		}

		public void Dispose()
		{
			readAIsTask.Dispose();
		}

		#endregion


		#region private region

        void configureReadAI(int numberOfMeasurements, bool autostart) //AND CAVITY VOLTAGE!!! 
        {
			data = new DataSet ();

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


        double[,] readAI(int numberOfMeasurements)
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
			
		#endregion

    }
}