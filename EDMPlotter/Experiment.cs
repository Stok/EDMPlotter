using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using DAQ;
using SharedCode;


namespace EDMPlotter
{
    public class Experiment
    {
        #region Declarations, constructors, accessors
        private readonly static Lazy<Experiment> _instance = new Lazy<Experiment>(() => new Experiment(GlobalHost.ConnectionManager.GetHubContext<PlotHub>().Clients));

        DataSet dataSet;
		ExperimentParameters parameters;
        enum ExperimentState { IsStopped, IsStarting, IsRunning, IsFinishing}
        ExperimentState es;

        object keepRunningCheckLock = new object();
        
        Thread experimentThread;

		IExperimentHardware hardware;

        public Experiment(IHubConnectionContext<dynamic> clients)
        {
            Clients = clients;

			//hardware = new DAQmxTriggeredMultiAIHardware();
			hardware = new FakeHardware();

            es = ExperimentState.IsStopped;
        }

        public static Experiment Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        private IHubConnectionContext<dynamic> Clients
        {
            get;
            set;
        }
        #endregion


        #region public
        public void StartExperiment()
        {
            if (es.Equals(ExperimentState.IsStopped))
            {

                es = ExperimentState.IsStarting;

                experimentThread = new Thread(new ThreadStart(run));
                experimentThread.Start();

                es = ExperimentState.IsRunning;


                //Data should be coming in here; As fake data, generate a point every 0.5 seconds.
            }
        }
        public void StopExperiment()
        {
            if (experimentThread != null)
            {
                es = ExperimentState.IsFinishing;
                experimentThread.Join();
            }
            es = ExperimentState.IsStopped;
        }

        public void ClearExperiment()
        {
			if (es.Equals (ExperimentState.IsStopped)) {
				Clients.All.clearData ();
			}
        }
        public void SaveExperiment(string path)
		{			
			if (es.Equals (ExperimentState.IsStopped)) {
				saveExperiment(path);
			}
            
        }

        #endregion

        #region RUN
        void run()
        {
            parameters = new ExperimentParameters();
			parameters.NumberOfPoints = 1000;

			hardware.Initialise (parameters);

			dataSet = hardware.Run ();

			//Push data down to the client like this.
			Clients.All.pushData(dataSet.ToJson());

			hardware.Dispose();
        }
        #endregion

        #region private 

        void saveExperiment(string path)
        {
            try {
                //To JSON
                //dataSet.SaveJson(path);
                //To CSV
                dataSet.SaveCSV(path);
            }
            catch (IOException e)
            {
                Console.WriteLine(e.Message);
            }
        }
        
    }
    #endregion
}